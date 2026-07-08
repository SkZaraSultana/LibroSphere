import React from 'react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onChange(pageNumber)}
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 transition ${pageNumber === page ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[var(--color-card)]'}`}
        >
          {pageNumber}
        </button>
      ))}
    </div>
  )
}
