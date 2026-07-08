import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] lg:min-h-[85vh]">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl text-5xl font-extrabold leading-tight text-[var(--color-text)] sm:text-6xl" style={{ fontFamily: 'Poppins' }}>
              Smart Library Operations. Simplified.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }} className="max-w-2xl text-lg leading-7 text-[var(--color-text-2)]">
              A beautifully crafted platform for managing books, members, lending, inventory, and analytics — designed for modern libraries and institutions.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.16 }} className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-8 py-4 text-lg font-semibold">Get Started</Link>
              <Link to="/how-it-works" className="btn-secondary px-8 py-4 text-lg font-semibold">Explore Features</Link>
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute -left-16 -top-10 h-44 w-44 rounded-full bg-[var(--color-accent)]/25 blur-3xl" />
            <div className="absolute right-8 top-12 h-32 w-32 rounded-full bg-[var(--color-primary)]/12 blur-3xl" />

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative w-full max-w-md rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[0_30px_90px_rgba(75,53,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">Sample Dashboard</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>Overview</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)]/90 text-white">📚</div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-xl bg-[var(--color-background)] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text-2)]">Checked out</p>
                    <p className="font-semibold text-[var(--color-text)]">3.8K</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--color-background)] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text-2)]">Members</p>
                    <p className="font-semibold text-[var(--color-text)]">8.9K</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
