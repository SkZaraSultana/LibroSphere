import React from 'react'
import { FiX } from 'react-icons/fi'

export default function Modal({ title, open, onClose, children, footer, className = '' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_30px_80px_rgba(75,53,42,0.08)] ${className}`}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-2)] transition hover:bg-[var(--color-card)]">
            <FiX size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="sticky bottom-0 flex-shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
