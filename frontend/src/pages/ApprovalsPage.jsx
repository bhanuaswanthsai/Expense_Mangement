import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { approveExpense, pendingApprovals, rejectExpense, historyApprovals } from '../services/expenseService.js'
import { Link } from 'react-router-dom'
import Shell from '../components/Layout/Shell.jsx'

export default function ApprovalsPage() {
  const { token } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const fetchData = async () => {
    try {
      const data = await pendingApprovals(token)
      setItems(data)
    } catch (e) {
      setError('Failed to load pending approvals')
    }
  }

  const fetchHistory = async () => {
    try {
      const data = await historyApprovals(token)
      setHistory(data)
    } catch (_) {}
  }

  useEffect(() => { fetchData(); fetchHistory() }, [])

  const onApprove = async (id) => {
    await approveExpense(token, id)
    await fetchData()
    await fetchHistory()
  }
  const onReject = async (id) => {
    const comment = window.prompt('Add a reason for rejection:')
    if (!comment || !comment.trim()) return
    await rejectExpense(token, id, comment)
    await fetchData()
    await fetchHistory()
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <div className="space-x-3">
          <button onClick={() => { fetchData(); fetchHistory() }} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 border">Refresh</button>
          <Link to="/" className="text-blue-600">Back</Link>
        </div>
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <div className="bg-white rounded-lg shadow mt-4 border overflow-hidden">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No pending approvals yet. Create an expense and ensure your Approval Rule has you as an approver.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-3">Expense ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Converted</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{e.id}</td>
                  <td className="p-3">{e.amount}</td>
                  <td className="p-3">{e.currency}</td>
                  <td className="p-3">{e.convertedAmount}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => onApprove(e.id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                    <button onClick={() => onReject(e.id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* My Decision History */}
      <div className="bg-white rounded-lg shadow mt-6 border overflow-hidden">
        <div className="p-3 font-medium">My Decision History</div>
        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No decisions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="p-3">When</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Expense</th>
                <th className="p-3">Action</th>
                <th className="p-3">Comment</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-t">
                  <td className="p-3">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="p-3">{h.expense?.employee?.name} (#{h.expense?.employee?.id})</td>
                  <td className="p-3">{h.expense?.amount} {h.expense?.currency} on {new Date(h.expense?.date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={
                      h.action === 'Approved' ? 'px-2 py-1 rounded text-green-700 bg-green-100'
                      : 'px-2 py-1 rounded text-red-700 bg-red-100'
                    }>
                      {h.action}
                    </span>
                  </td>
                  <td className="p-3">{h.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  )
}
