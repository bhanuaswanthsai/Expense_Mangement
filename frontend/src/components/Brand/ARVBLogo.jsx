import React from 'react'

export default function ARVBLogo({ size = 28, label = 'ARVB' }) {
  const s = size
  return (
    <div className="flex items-center gap-2" aria-label="ARVB logo">
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Airplane silhouette */}
        <path d="M6 36 L58 28 L58 36 L34 38 L26 56 L20 56 L24 38 L6 36 Z" fill="#3b82f6" opacity="0.9"/>
        {/* Fuselage outline */}
        <path d="M6 36 L58 28 L58 36 L34 38 L26 56 L20 56 L24 38 L6 36 Z" stroke="#0ea5e9" strokeWidth="2" fill="none"/>
        {/* Cabin window */}
        <circle cx="44" cy="32" r="2" fill="#e0f2fe"/>
        {/* Text badge inside plane */}
        <rect x="25" y="40" width="18" height="10" rx="2" fill="#1e293b" opacity="0.9"/>
        <text x="34" y="47" textAnchor="middle" fontSize="7" fontWeight="700" fill="#f8fafc">{label}</text>
      </svg>
      <span className="hidden sm:block font-semibold tracking-wide text-slate-900 dark:text-slate-100">{label}</span>
    </div>
  )
}
