import React from 'react'

export default function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-full btn-primary px-6 py-3 font-semibold disabled:opacity-60"
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
