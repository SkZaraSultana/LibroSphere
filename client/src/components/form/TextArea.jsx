import React from 'react'

export default function TextArea({ label, name, value, onChange, placeholder, error }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text-2)]">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
