import prisma from '../config/database.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const createRule = asyncHandler(async (req, res) => {
  const { type, percentage, specificApproverId, isManagerApprover, approvers } = req.body;
  if (!type || !approvers) return res.status(400).json({ message: 'Missing required fields' });
  const rule = await prisma.approvalRule.create({
    data: {
      companyId: req.user.companyId,
      type,
      percentage,
      specificApproverId,
      isManagerApprover: Boolean(isManagerApprover),
      approvers,
    },
  });
  res.status(201).json(rule);
});

export const getRules = asyncHandler(async (req, res) => {
  const rules = await prisma.approvalRule.findMany({ where: { companyId: req.user.companyId } });
  res.json(rules);
});

export const updateRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.approvalRule.update({ where: { id: Number(id) }, data });
  res.json(updated);
});

export const historyForCurrentUser = asyncHandler(async (req, res) => {
  const approvals = await prisma.approval.findMany({
    where: {
      approverId: req.user.id,
      expense: { companyId: req.user.companyId },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      expense: {
        include: {
          employee: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  res.json(approvals.map(a => ({
    id: a.id,
    action: a.action,
    comment: a.comment,
    timestamp: a.timestamp,
    expense: {
      id: a.expense.id,
      amount: a.expense.amount,
      currency: a.expense.currency,
      convertedAmount: a.expense.convertedAmount,
      status: a.expense.status,
      date: a.expense.date,
      employee: a.expense.employee,
    }
  })));
});
