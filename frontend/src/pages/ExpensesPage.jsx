import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { createExpense, listExpenses } from '../services/expenseService.js'
import { Link } from 'react-router-dom'
import Shell from '../components/Layout/Shell.jsx'

export default function ExpensesPage() {
  const { token, user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ amount: '', currency: 'USD', category: 'Meals', description: '', date: new Date().toISOString().slice(0,10) })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      const data = await listExpenses(token)
      setItems(data)
    } catch (e) {
      setError('Failed to load expenses')
    }
  }

  useEffect(() => { fetchData() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createExpense(token, form)
      setForm({ amount: '', currency: 'USD', category: 'Meals', description: '', date: new Date().toISOString().slice(0,10) })
      await fetchData()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Link to="/" className="text-blue-600">Back</Link>
      </div>

      {(user?.role === 'Employee' || user?.role === 'Admin') && (
        <form onSubmit={submit} className="bg-white p-4 mt-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-3 border">
          <input className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} />
          <input className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Currency" value={form.currency} onChange={e=>setForm({...form, currency: e.target.value})} />
          <input className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
          <input className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
          <input className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
          <div className="md:col-span-5">
            <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded">{loading ? 'Submitting...' : 'Submit Expense'}</button>
          </div>
          {error && <div className="text-red-600 md:col-span-5">{error}</div>}
        </form>
      )}

      <div className="bg-white rounded-lg shadow mt-6 border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-3">ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Converted</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{e.id}</td>
                <td className="p-3">{e.amount}</td>
                <td className="p-3">{e.currency}</td>
                <td className="p-3">{e.convertedAmount}</td>
                <td className="p-3">
                  <span className={
                    e.status === 'Approved' ? 'px-2 py-1 rounded text-green-700 bg-green-100'
                    : e.status === 'Rejected' ? 'px-2 py-1 rounded text-red-700 bg-red-100'
                    : 'px-2 py-1 rounded text-yellow-800 bg-yellow-100'
                  }>
                    {e.status}
                  </span>
                </td>
                <td className="p-3">{new Date(e.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  )
}
