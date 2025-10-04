import Header from './Header.jsx'

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="mt-10 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Expense Management
      </footer>
    </div>
  )
}
