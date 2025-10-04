import ThemeToggle from '../Theme/ThemeToggle.jsx'
import DAEASLogo from '../Brand/DAEASLogo.jsx'

export default function Header() {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-800/70">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DAEASLogo size={28} />
          <span className="font-semibold text-slate-900 dark:text-slate-100">Expense Management</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
