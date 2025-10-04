import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'
import Shell from '../components/Layout/Shell.jsx'

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext)
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div />
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {user ? (
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow p-5 card-lift">
            <div className="text-sm text-gray-500 dark:text-slate-400">Signed in as</div>
            <div className="text-lg font-medium">{user.name}</div>
            <div className="text-sm text-gray-600 dark:text-slate-300">{user.email}</div>
            <div className="mt-3 text-sm"><b>Role:</b> {user.role}</div>
            <div className="text-sm"><b>Company:</b> {user.company?.name} ({user.company?.currency})</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow p-5">Please login from <Link to="/login" className="text-blue-600">Login</Link></div>
        )}
        <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow p-5 card-lift">
          <div className="font-medium mb-2">Quick Links</div>
          <div className="flex flex-wrap gap-2">
            <Link to="/expenses" className="px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition">Create Expense</Link>
            <Link to="/approvals" className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">Pending Approvals</Link>
          </div>
        </div>
      </div>
    </Shell>
  )
}
