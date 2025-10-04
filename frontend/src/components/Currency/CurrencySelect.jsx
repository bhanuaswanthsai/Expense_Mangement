import { useEffect, useMemo, useRef, useState } from 'react'

function buildCurrencyList(raw) {
  const map = new Map()
  for (const c of raw) {
    const currencies = c.currencies || {}
    const entries = Object.entries(currencies)
    for (const [code, meta] of entries) {
      if (!code) continue
      if (!map.has(code)) {
        map.set(code, { code, name: meta?.name || code })
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code))
}

export default function CurrencySelect({ value, onChange, placeholder = 'Select currency' }) {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const buttonRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    let mounted = true
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(r => r.json())
      .then(data => { if (mounted) setList(buildCurrencyList(data)) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    if (!q) return list
    const qq = q.toLowerCase()
    return list.filter(c => c.code.toLowerCase().includes(qq) || c.name.toLowerCase().includes(qq))
  }, [q, list])

  const select = (code) => {
    try {
      const recents = JSON.parse(localStorage.getItem('recentCurrencies') || '[]')
      const next = [code, ...recents.filter(x => x !== code)].slice(0, 5)
      localStorage.setItem('recentCurrencies', JSON.stringify(next))
    } catch {}
    onChange && onChange(code)
    setOpen(false)
    setActiveIndex(-1)
    buttonRef.current?.focus()
  }

  const recents = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('recentCurrencies') || '[]') } catch { return [] }
  }, [open])

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      setTimeout(()=> listRef.current?.focus(), 0)
      return
    }
    if (!open) return
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min((i < 0 ? 0 : i + 1), filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && filtered[activeIndex]) select(filtered[activeIndex].code)
    }
  }

  return (
    <div className="relative" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full border rounded p-2 text-left bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
        onClick={() => setOpen(o=>!o)}
      >
        {value || placeholder}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded shadow">
          <div className="p-2">
            <input
              aria-label="Search currencies"
              value={q}
              onChange={e=>{ setQ(e.target.value); setActiveIndex(0) }}
              placeholder="Search code or name"
              className="w-full border rounded p-2 bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            />
          </div>
          {recents.length > 0 && (
            <div className="px-2 pb-1 text-xs text-slate-500 dark:text-slate-400">Recent</div>
          )}
          {recents.map(code => (
            <div key={code} role="option" aria-selected={false} onClick={()=>select(code)} className="px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">{code}</div>
          ))}
          <div ref={listRef} tabIndex={-1} role="listbox" aria-label="Currencies" className="max-h-56 overflow-auto py-1 divide-y dark:divide-slate-700">
            {filtered.map((c, idx) => (
              <div
                key={c.code}
                role="option"
                aria-selected={value === c.code}
                onClick={()=>select(c.code)}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${idx===activeIndex ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              >
                <span>{c.code}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-3 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
