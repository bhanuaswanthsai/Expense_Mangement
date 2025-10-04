import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { createExpense, listExpenses } from '../services/expenseService.js'
import { Link } from 'react-router-dom'
import Shell from '../components/Layout/Shell.jsx'
import OCRUpload from '../components/OCR/OCRUpload.jsx'
import CurrencySelect from '../components/Currency/CurrencySelect.jsx'
import toast from 'react-hot-toast'
import Skeleton from '../components/UI/Skeleton.jsx'

export default function ExpensesPage() {
  const { token, user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ amount: '', currency: 'USD', category: 'Meals', description: '', date: new Date().toISOString().slice(0,10) })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [listLoading, setListLoading] = useState(false)

  const fetchData = async () => {
    try {
      setListLoading(true)
      const data = await listExpenses(token)
      setItems(data)
    } catch (e) {
      setError('Failed to load expenses')
    } finally {
      setListLoading(false)
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
      toast.success('Expense submitted')
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create expense')
      toast.error('Failed to submit expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Link to="/" className="text-blue-600 hover:opacity-80 transition" title="Back to Dashboard">Back</Link>
      </div>

      {(user?.role === 'Employee' || user?.role === 'Admin') && (
        <>
          <div className="mt-4"><OCRUpload onExtract={(x)=>{
            setForm(f=>({
              ...f,
              amount: x.amount || f.amount,
              description: x.description || f.description,
              category: x.category || f.category,
              date: x.date || f.date,
            }))
          }} /></div>
          <form onSubmit={submit} className="bg-white dark:bg-slate-800 p-4 mt-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-6 gap-3 border dark:border-slate-700">
            <div className="relative">
              <input className="peer w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder=" " value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} />
              <label className="absolute left-2 top-2 text-slate-500 dark:text-slate-400 transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-600 bg-white dark:bg-slate-900 px-1">Amount</label>
            </div>
            <div>
              <CurrencySelect value={form.currency} onChange={(code)=>setForm({...form, currency: code})} />
            </div>
            <div className="relative">
              <input className="peer w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder=" " value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
              <label className="absolute left-2 top-2 text-slate-500 dark:text-slate-400 transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-600 bg-white dark:bg-slate-900 px-1">Category</label>
            </div>
            <div className="relative md:col-span-2">
              <input className="peer w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder=" " value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
              <label className="absolute left-2 top-2 text-slate-500 dark:text-slate-400 transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-600 bg-white dark:bg-slate-900 px-1">Description</label>
            </div>
            <div>
              <input className="border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
            </div>
            <div className="md:col-span-6">
              <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 transition transform hover:scale-[1.02] text-white px-4 py-2 rounded shadow hover:shadow-lg">{loading ? 'Submitting...' : 'Submit Expense'}</button>
            </div>
            {error && <div className="text-red-600 md:col-span-6">{error}</div>}
          </form>
        </>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow mt-6 border dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-3">ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Converted</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {listLoading && Array.from({length:5}).map((_,i)=> (
              <tr key={`sk-${i}`} className="border-t dark:border-slate-700">
                <td className="p-3"><Skeleton className="h-4 w-10" /></td>
                <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                <td className="p-3"><Skeleton className="h-6 w-20" /></td>
                <td className="p-3"><Skeleton className="h-4 w-24" /></td>
              </tr>
            ))}
            {!listLoading && items.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500 dark:text-slate-400">No expenses yet. Use the form above or scan a receipt to get started.</td>
              </tr>
            )}
            {!listLoading && items.map(e => (
              <tr key={e.id} className="border-t dark:border-slate-700 odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
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
