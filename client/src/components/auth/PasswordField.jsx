import React, { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function PasswordField({ label, value, onChange, name, placeholder, error }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-2)]">{label}</label>
      <div className="relative mt-2">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pr-12 outline-none"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-3 text-[var(--color-text-2)]">
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
