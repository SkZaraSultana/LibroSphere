import React from 'react'

const statusClasses = {
  Available: 'bg-emerald-100 text-emerald-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  'Out of Stock': 'bg-[rgba(182,124,82,0.16)] text-[var(--color-text)]',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] || 'bg-[var(--color-border)] text-[var(--color-text-2)]'}`}>
      {status}
    </span>
  )
}
