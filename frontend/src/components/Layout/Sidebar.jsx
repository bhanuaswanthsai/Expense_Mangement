import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DAEASLogo from '../Brand/DAEASLogo.jsx'

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Add Expense' },
  { to: '/expenses', label: 'Expense History' },
  { to: '/approvals', label: 'Approvals' },
  { to: '/admin', label: 'Admin' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const loc = useLocation()

  return (
    <div className="fixed left-0 top-0 h-full z-20">
      <button
        aria-label={open ? 'Collapse menu' : 'Expand menu'}
        className="absolute top-3 -right-3 bg-slate-800 text-white dark:bg-slate-700 rounded-full w-6 h-6 text-xs shadow"
        onClick={() => setOpen(o=>!o)}
        title={open ? 'Collapse' : 'Expand'}
      >{open ? '⟨' : '⟩'}</button>
      <aside className={`h-full ${open ? 'w-56' : 'w-12'} transition-all duration-200 bg-slate-900 text-slate-100 shadow-xl overflow-hidden`}>
        <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-800">
          <DAEASLogo size={22} label={open ? 'DAEAS' : ''} />
        </div>
        <nav className="py-2">
          {items.map(it => (
            <Link key={it.to} to={it.to} className={`block px-3 py-2 text-base md:text-[15px] font-medium hover:bg-slate-800 transition ${loc.pathname===it.to ? 'bg-slate-800 text-white' : 'text-slate-300'}`}>
              {open ? it.label : it.label[0]}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  )
}
