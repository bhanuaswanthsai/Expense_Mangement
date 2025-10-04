import { apiClient } from './api.js'

export async function createExpense(token, payload) {
  const { data } = await apiClient(token).post('/expenses', payload)
  return data
}

export async function listExpenses(token, opts = {}) {
  const params = new URLSearchParams()
  if (opts.employeeId) params.set('employeeId', opts.employeeId)
  if (opts.fromDate) params.set('fromDate', opts.fromDate)
  if (opts.toDate) params.set('toDate', opts.toDate)
  if (opts.targetCurrency) params.set('targetCurrency', opts.targetCurrency)
  const path = params.toString() ? `/expenses?${params.toString()}` : '/expenses'
  const { data } = await apiClient(token).get(path)
  return data
}

export async function getExpense(token, id) {
  const { data } = await apiClient(token).get(`/expenses/${id}`)
  return data
}

export async function approveExpense(token, id) {
  const { data } = await apiClient(token).put(`/expenses/${id}/approve`)
  return data
}

export async function rejectExpense(token, id, comment) {
  const { data } = await apiClient(token).put(`/expenses/${id}/reject`, { comment })
  return data
}

export async function pendingApprovals(token) {
  const { data } = await apiClient(token).get(`/approvals/pending`)
  return data
}

export async function historyApprovals(token) {
  const { data } = await apiClient(token).get(`/approvals/history`)
  return data
}
