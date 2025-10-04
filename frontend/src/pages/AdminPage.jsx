import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { createUser, listUsers } from '../services/userService.js'
import { Link } from 'react-router-dom'
import { approveExpense, pendingApprovals, rejectExpense } from '../services/expenseService.js'

export default function AdminPage() {
  const { token, user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee', managerId: '' })
  const [error, setError] = useState(null)
  const [assign, setAssign] = useState({ employeeId: '', managerId: '' })
  const [pending, setPending] = useState([])
  const [historyFilter, setHistoryFilter] = useState({ employeeId: '', fromDate: '', toDate: '' })
  const [history, setHistory] = useState([])

  const fetchData = async () => {
    try {
      const data = await listUsers(token)
      setUsers(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load users')
    }
  }
  useEffect(() => { fetchData() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createUser(token, { ...form, managerId: form.managerId ? Number(form.managerId) : null })
      setForm({ name: '', email: '', password: '', role: 'Employee', managerId: '' })
      await fetchData()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create user (Admin only)')
    }
  }

  const doAssign = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (!assign.employeeId || !assign.managerId) throw new Error('Select both employee and manager')
      const emp = users.find(u => String(u.id) === String(assign.employeeId))
      const mgr = users.find(u => String(u.id) === String(assign.managerId))
      if (!emp || !mgr) throw new Error('Invalid selection')
      // Reuse update user endpoint to set managerId
      const res = await fetch(`/api/users/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ managerId: Number(mgr.id), role: emp.role })
      })
      if (!res.ok) throw new Error('Failed to assign')
      await fetchData()
    } catch (e) {
      setError(e.message || 'Failed to assign')
    }
  }

  const loadPending = async () => {
    try {
      const p = await pendingApprovals(token)
      setPending(p)
    } catch (_) {}
  }
  useEffect(() => { loadPending() }, [])

  const overrideApprove = async (id) => { await approveExpense(token, id); await loadPending() }
  const overrideReject = async (id) => { await rejectExpense(token, id, 'Admin override'); await loadPending() }

  const loadHistory = async (e) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (historyFilter.employeeId) params.set('employeeId', historyFilter.employeeId)
    if (historyFilter.fromDate) params.set('fromDate', historyFilter.fromDate)
    if (historyFilter.toDate) params.set('toDate', historyFilter.toDate)
    const res = await fetch(`/api/expenses?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setHistory(data)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Link to="/dashboard" className="text-blue-600">Back</Link>
      </div>

      {user?.role !== 'Admin' ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          You must be an Admin to create users. Please login as an Admin.
        </div>
      ) : (
        <>
          {/* Create Employees/Managers */}
          <form onSubmit={submit} className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-5 gap-3">
            <input className="border rounded p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            <input className="border rounded p-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            <input className="border rounded p-2" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            <select className="border rounded p-2" value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
              <option>Employee</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
            <input className="border rounded p-2" placeholder="Manager ID (optional)" value={form.managerId} onChange={e=>setForm({...form, managerId: e.target.value})} />
            <div className="md:col-span-5">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Create User</button>
            </div>
          </form>

          {/* Assign Employees to Managers */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded shadow border dark:border-slate-700">
            <div className="font-medium mb-3">Assign Employee to Manager</div>
            <form onSubmit={doAssign} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="border rounded p-2" value={assign.employeeId} onChange={e=>setAssign({...assign, employeeId: e.target.value})}>
                <option value="">Select Employee</option>
                {users.filter(u=>u.role==='Employee').map(u=> (
                  <option key={u.id} value={u.id}>{u.name} (#{u.id})</option>
                ))}
              </select>
              <select className="border rounded p-2" value={assign.managerId} onChange={e=>setAssign({...assign, managerId: e.target.value})}>
                <option value="">Select Manager</option>
                {users.filter(u=>u.role==='Manager').map(u=> (
                  <option key={u.id} value={u.id}>{u.name} (#{u.id})</option>
                ))}
              </select>
              <button className="bg-slate-800 text-white px-4 py-2 rounded">Assign</button>
            </form>
          </div>

          {/* Pending Approvals (Admin can override) */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded shadow border dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="font-medium">Pending Approvals (Admin Override)</div>
              <button onClick={loadPending} className="px-3 py-1.5 border rounded">Refresh</button>
            </div>
            <div className="mt-3 overflow-auto">
              {pending.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-slate-400">No pending approvals.</div>
              ) : (
                <table className="w-full text-sm text-slate-900 dark:text-white">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr className="text-left text-gray-700 dark:text-white">
                      <th className="p-2">ID</th>
                      <th className="p-2">Employee</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Currency</th>
                      <th className="p-2">Converted</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(e => (
                      <tr key={e.id} className="border-t dark:border-slate-700">
                        <td className="p-2">{e.id}</td>
                        <td className="p-2">{e.employeeId}</td>
                        <td className="p-2">{e.amount}</td>
                        <td className="p-2">{e.currency}</td>
                        <td className="p-2">{e.convertedAmount}</td>
                        <td className="p-2 space-x-2">
                          <button onClick={()=>overrideApprove(e.id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                          <button onClick={()=>overrideReject(e.id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Expense History by Employee and Date Range */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded shadow border dark:border-slate-700">
            <div className="font-medium mb-3">Expense History</div>
            <form onSubmit={loadHistory} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select className="border rounded p-2" value={historyFilter.employeeId} onChange={e=>setHistoryFilter({...historyFilter, employeeId: e.target.value})}>
                <option value="">All Employees</option>
                {users.map(u=> (
                  <option key={u.id} value={u.id}>{u.name} (#{u.id})</option>
                ))}
              </select>
              <input className="border rounded p-2" type="date" value={historyFilter.fromDate} onChange={e=>setHistoryFilter({...historyFilter, fromDate: e.target.value})} />
              <input className="border rounded p-2" type="date" value={historyFilter.toDate} onChange={e=>setHistoryFilter({...historyFilter, toDate: e.target.value})} />
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
            </form>
            <div className="mt-3 overflow-auto">
              {history.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-slate-400">No results.</div>
              ) : (
                <table className="w-full text-sm text-slate-900 dark:text-white">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr className="text-left text-gray-700 dark:text-white">
                      <th className="p-2">ID</th>
                      <th className="p-2">Employee</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Currency</th>
                      <th className="p-2">Converted</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(e => (
                      <tr key={e.id} className="border-t dark:border-slate-700">
                        <td className="p-2">{e.id}</td>
                        <td className="p-2">{e.employeeId}</td>
                        <td className="p-2">{e.amount}</td>
                        <td className="p-2">{e.currency}</td>
                        <td className="p-2">{e.convertedAmount}</td>
                        <td className="p-2">{e.status}</td>
                        <td className="p-2">{new Date(e.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="bg-white dark:bg-slate-800 rounded shadow border dark:border-slate-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr className="text-left text-gray-700 dark:text-white">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Manager</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 dark:text-white">
            {users.map(u => (
              <tr key={u.id} className="border-t dark:border-slate-700">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.managerId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
