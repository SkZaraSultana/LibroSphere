import React from 'react'

export default function InputField({ label, type = 'text', value, onChange, name, placeholder, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-2)]">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
