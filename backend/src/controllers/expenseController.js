import prisma from '../config/database.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { convertAmount } from '../utils/currencyConverter.js';
import { parseReceipt } from '../utils/ocrService.js';

async function getCompanyCurrency(companyId) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  return company.currency;
}

export const createExpense = asyncHandler(async (req, res) => {
  const { amount, currency, category, description, date, receiptBase64 } = req.body;
  let payload = { amount, currency, category, description, date };
  if (receiptBase64) {
    const parsed = await parseReceipt(receiptBase64);
    payload = { ...parsed, ...payload };
  }
  const companyCurrency = await getCompanyCurrency(req.user.companyId);
  const converted = await convertAmount(payload.amount, payload.currency, companyCurrency);
  const expense = await prisma.expense.create({
    data: {
      employeeId: req.user.id,
      companyId: req.user.companyId,
      amount: payload.amount,
      currency: payload.currency,
      convertedAmount: converted,
      category: payload.category,
      description: payload.description,
      date: new Date(payload.date),
    },
  });
  res.status(201).json(expense);
});

export const getExpenses = asyncHandler(async (req, res) => {
  const user = req.user;
  const { employeeId, fromDate, toDate, targetCurrency } = req.query;
  let where = { companyId: user.companyId };

  // base visibility
  if (user.role === 'Employee') {
    where = { ...where, employeeId: user.id };
  } else if (user.role === 'Manager') {
    const teamIds = await prisma.user.findMany({ where: { managerId: user.id }, select: { id: true } });
    const team = teamIds.map(t => t.id);
    where = { ...where, OR: [{ employeeId: user.id }, { employeeId: { in: team } }] };
  }

  // filters
  if (employeeId) {
    const empIdNum = Number(employeeId);
    if (user.role === 'Admin') {
      where = { ...where, employeeId: empIdNum };
    } else if (user.role === 'Manager') {
      // restrict to team/self
      where = { ...where, employeeId: empIdNum };
    } // Employee already restricted to self above
  }
  if (fromDate || toDate) {
    where = {
      ...where,
      date: {
        ...(fromDate ? { gte: new Date(fromDate) } : {}),
        ...(toDate ? { lte: new Date(toDate) } : {}),
      }
    };
  }

  const expenses = await prisma.expense.findMany({ where, orderBy: { createdAt: 'desc' } });

  // If a targetCurrency is requested, attach a per-expense converted amount for display
  if (targetCurrency) {
    const normalizedTarget = String(targetCurrency).toUpperCase();
    const withDisplay = await Promise.all(expenses.map(async (e) => {
      try {
        const displayAmount = await convertAmount(e.amount, e.currency, normalizedTarget);
        return { ...e, displayCurrency: normalizedTarget, displayAmount };
      } catch {
        return { ...e, displayCurrency: normalizedTarget, displayAmount: null };
      }
    }));
    return res.json(withDisplay);
  }

  res.json(expenses);
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const expense = await prisma.expense.findFirst({ where: { id, companyId: req.user.companyId } });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

async function evaluateConditionalRules(expense, approvals, rules, approvers) {
  const approvedCount = approvals.filter(a => a.action === 'Approved').length;
  const totalApprovers = approvers.length;
  const percentageSatisfied = rules.type === 'percentage' || rules.type === 'hybrid'
    ? (approvedCount / totalApprovers) * 100 >= (rules.percentage || 100)
    : false;
  const specificSatisfied = (rules.type === 'specific' || rules.type === 'hybrid')
    ? approvals.some(a => a.approverId === rules.specificApproverId && a.action === 'Approved')
    : false;
  return percentageSatisfied || specificSatisfied;
}

async function getEffectiveApproversForExpense(expense, rules) {
  // Normalize base approvers from rules
  const baseApprovers = Array.isArray(rules.approvers) ? rules.approvers.map((v) => Number(v)) : [];
  if (rules.isManagerApprover) {
    const employee = await prisma.user.findUnique({ where: { id: expense.employeeId } });
    if (employee?.managerId) {
      // Put manager first, then the rest (avoid duplicate if manager is already in list)
      const rest = baseApprovers.filter((id) => id !== Number(employee.managerId));
      return [Number(employee.managerId), ...rest];
    }
  }
  return baseApprovers;
}

export const approveExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.companyId !== req.user.companyId) return res.status(404).json({ message: 'Expense not found' });

  // Get rules
  const rules = await prisma.approvalRule.findFirst({ where: { companyId: req.user.companyId } });
  if (!rules) return res.status(400).json({ message: 'Approval rules not configured' });
  // Effective approvers may include manager first
  const approvers = await getEffectiveApproversForExpense(expense, rules);
  if (approvers.length === 0) return res.status(400).json({ message: 'No approvers configured' });

  // Authorization: Admin can override; otherwise current approver must match index
  const currentApproverId = approvers[expense.currentApproverIndex];
  if (req.user.role !== 'Admin' && currentApproverId !== Number(req.user.id)) {
    return res.status(403).json({ message: 'Not current approver' });
  }

  await prisma.approval.create({ data: { expenseId: expense.id, approverId: req.user.id, action: 'Approved' } });
  let nextIndex = expense.currentApproverIndex + 1;

  // Conditional checks
  const approvals = await prisma.approval.findMany({ where: { expenseId: expense.id } });
  const autoApprove = await evaluateConditionalRules(expense, approvals, rules, approvers);

  const isFinal = nextIndex >= approvers.length || autoApprove;
  const updated = await prisma.expense.update({
    where: { id: expense.id },
    data: {
      status: isFinal ? 'Approved' : 'Pending',
      currentApproverIndex: isFinal ? expense.currentApproverIndex : nextIndex,
    },
  });
  res.json(updated);
});

export const rejectExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { comment } = req.body;
  if (!comment || String(comment).trim() === '') {
    return res.status(400).json({ message: 'Rejection comment is required' });
  }
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.companyId !== req.user.companyId) return res.status(404).json({ message: 'Expense not found' });

  // Authorization: Admin can override; otherwise must be current approver
  const rules = await prisma.approvalRule.findFirst({ where: { companyId: req.user.companyId } });
  const approvers = await getEffectiveApproversForExpense(expense, rules);
  const currentApproverId = approvers[expense.currentApproverIndex];
  if (req.user.role !== 'Admin' && currentApproverId !== Number(req.user.id)) {
    return res.status(403).json({ message: 'Not current approver' });
  }

  await prisma.approval.create({ data: { expenseId: expense.id, approverId: req.user.id, action: 'Rejected', comment } });
  const updated = await prisma.expense.update({ where: { id }, data: { status: 'Rejected' } });
  res.json(updated);
});

export const pendingForUser = asyncHandler(async (req, res) => {
  const rules = await prisma.approvalRule.findFirst({ where: { companyId: req.user.companyId } });
  if (!rules) return res.json([]);
  const expenses = await prisma.expense.findMany({
    where: {
      companyId: req.user.companyId,
      status: 'Pending',
    },
    orderBy: { createdAt: 'desc' }
  });

  // Prevent caching so client always sees latest pending list
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  // Admins can view all pending approvals (override permission)
  if (req.user.role === 'Admin') {
    return res.json(expenses);
  }

  // Managers/Employees see only items where they are the current approver
  const pending = [];
  for (const e of expenses) {
    const eff = await getEffectiveApproversForExpense(e, rules);
    if (eff[e.currentApproverIndex] === Number(req.user.id)) pending.push(e);
  }
  res.json(pending);
});
