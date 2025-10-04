import Header from './Header.jsx'
import { Toaster } from 'react-hot-toast'

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 bg-animated">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="mt-10 py-6 text-center text-xs text-gray-400 dark:text-slate-500">
        © {new Date().getFullYear()} Expense Management
      </footer>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#0f172a' },
        className: 'dark:!bg-slate-800 dark:!text-slate-100'
      }} />
    </div>
  )
}
