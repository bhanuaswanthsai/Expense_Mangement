import React from 'react'

// Cloud logo with DAEAA text inside
export default function DAEASLogo({ size = 28, label = 'DAEAA' }) {
  const s = size
  return (
    <div className="flex items-center gap-2" aria-label="DAEAS logo">
      <svg width={s} height={s} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
        {/* Cloud shape */}
        <path d="M20 40c-6 0-10-4-10-9s4-9 10-9c1.4-5.5 6.5-9 12-9 7.2 0 13 5.8 13 13v1c4.4 0 8 3.6 8 8s-3.6 8-8 8H20z" fill="#3b82f6"/>
        <path d="M20 40c-6 0-10-4-10-9s4-9 10-9c1.4-5.5 6.5-9 12-9 7.2 0 13 5.8 13 13v1c4.4 0 8 3.6 8 8s-3.6 8-8 8H20z" fill="none" stroke="#1d4ed8" strokeWidth="2"/>
        {/* Text inside cloud */}
        <rect x="18" y="26" width="28" height="14" rx="3" fill="#1e293b" opacity="0.85"/>
        <text x="32" y="36" textAnchor="middle" fontSize="9" fontWeight="800" fill="#f8fafc">{label}</text>
      </svg>
      <span className="hidden sm:block font-semibold tracking-wide text-slate-900 dark:text-slate-100">{label}</span>
    </div>
  )
}
