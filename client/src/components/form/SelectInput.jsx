import React from 'react'

export default function SelectInput({ label, name, value, onChange, options, error }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text-2)]">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none"
      >
        <option value="">Select a category</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
