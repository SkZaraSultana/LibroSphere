import React from 'react'

// AuthLayout centers a glass card with consistent padding and background
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[linear-gradient(180deg,#F8F4EE_0%,#F3ECE3_100%)]">
      <div className="w-full max-w-md rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[0_30px_80px_rgba(75,53,42,0.06)]">
        {children}
      </div>
    </div>
  )
}
