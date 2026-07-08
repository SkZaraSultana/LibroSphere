import React from 'react'

// Dashboard header — keep minimal for now.
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-sm px-6 py-4 shadow-sm">
      <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[1280px]">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">Library Operations Overview</h1>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm text-[var(--color-text-2)] shadow-sm">
          Welcome back, librarian
        </div>
      </div>
    </header>
  )
}
