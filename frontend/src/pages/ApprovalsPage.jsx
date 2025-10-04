import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { approveExpense, pendingApprovals, rejectExpense, historyApprovals } from '../services/expenseService.js'
import { Link } from 'react-router-dom'
import Shell from '../components/Layout/Shell.jsx'
import Skeleton from '../components/UI/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function ApprovalsPage() {
  const { token } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [listLoading, setListLoading] = useState(false)

  const fetchData = async () => {
    try {
      setListLoading(true)
      const data = await pendingApprovals(token)
      setItems(data)
    } catch (e) {
      setError('Failed to load pending approvals')
    } finally {
      setListLoading(false)
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
    try {
      await approveExpense(token, id)
      toast.success('Approved')
      await fetchData()
      await fetchHistory()
    } catch {
      toast.error('Failed to approve')
    }
  }
  const onReject = async (id) => {
    const comment = window.prompt('Add a reason for rejection:')
    if (!comment || !comment.trim()) return
    try {
      await rejectExpense(token, id, comment)
      toast('Rejected', { icon: '❌' })
      await fetchData()
      await fetchHistory()
    } catch {
      toast.error('Failed to reject')
    }
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow mt-4 border dark:border-slate-700 overflow-hidden">
        {listLoading ? (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-3">Expense ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Converted</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length:5}).map((_,i)=> (
                <tr key={`sk-ap-${i}`} className="border-t dark:border-slate-700">
                  <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-3"><Skeleton className="h-8 w-28" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No pending approvals yet. Create an expense and ensure your Approval Rule has you as an approver.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-3">Expense ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Converted</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {items.map(e => (
                <tr key={e.id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                  <td className="p-3">{e.id}</td>
                  <td className="p-3">{e.amount}</td>
                  <td className="p-3">{e.currency}</td>
                  <td className="p-3">{e.convertedAmount}</td>
                  <td className="p-3 space-x-2">
                    <button aria-label={`Approve expense ${e.id}`} title="Approve" onClick={() => onApprove(e.id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 transition text-white rounded">Approve</button>
                    <button aria-label={`Reject expense ${e.id}`} title="Reject" onClick={() => onReject(e.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 transition text-white rounded">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* My Decision History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow mt-6 border dark:border-slate-700 overflow-hidden">
        <div className="p-3 font-medium">My Decision History</div>
        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No decisions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr className="text-left text-gray-500">
                <th className="p-3">When</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Expense</th>
                <th className="p-3">Action</th>
                <th className="p-3">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {history.map(h => (
                <tr key={h.id} className="border-t dark:border-slate-700">
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
