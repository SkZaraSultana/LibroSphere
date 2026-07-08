import React from 'react'

export default function SectionHeading({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
