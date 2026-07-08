import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--color-border)] bg-[var(--color-background)]/90 py-12">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-3 text-white shadow-md">
            <span className="font-black">LS</span>
            <span className="font-semibold">LibroSphere</span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[var(--color-text-2)]">
            Smart Library Operations. Simplified.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text)]">Product</h4>
          <ul className="mt-5 space-y-3 text-sm text-[var(--color-text-2)]">
            <li><Link to="/how-it-works" className="transition hover:text-[var(--color-primary)]">How It Works</Link></li>
            <li><Link to="/" className="transition hover:text-[var(--color-primary)]">Features</Link></li>
            <li><a href="#" className="transition hover:text-[var(--color-primary)]">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text)]">Company</h4>
          <ul className="mt-5 space-y-3 text-sm text-[var(--color-text-2)]">
            <li><Link to="/about" className="transition hover:text-[var(--color-primary)]">About</Link></li>
            <li><a href="#" className="transition hover:text-[var(--color-primary)]">Careers</a></li>
            <li><a href="#" className="transition hover:text-[var(--color-primary)]">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text)]">Connect</h4>
          <ul className="mt-5 space-y-3 text-sm text-[var(--color-text-2)]">
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-[var(--color-primary)]">GitHub</a></li>
            <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="transition hover:text-[var(--color-primary)]">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-2)]">
        © {new Date().getFullYear()} LibroSphere. All rights reserved.
      </div>
    </footer>
  )
}
