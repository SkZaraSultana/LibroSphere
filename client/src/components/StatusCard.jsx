import React from 'react'

export default function StatusCard({ title, description, children }) {
  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">{title}</p>
        <p className="mt-2 text-sm text-[var(--color-text-2)]">{description}</p>
      </div>
      {children}
    </section>
  )
}
