import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-[var(--color-background)] p-10 sm:p-12 shadow-[0_30px_80px_rgba(75,53,42,0.06)] border border-[var(--color-border)]">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Ready to modernize your library?
            </motion.p>
            <motion.h3 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-4 text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl" style={{ fontFamily: 'Poppins' }}>
              Join libraries that are moving library operations forward.
            </motion.h3>
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-2)]">
              Join libraries who’ve reduced manual work and improved lending operations with LibroSphere.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4 justify-end">
            <Link to="/register" className="btn-primary px-6 py-3 text-lg font-semibold">Create Account</Link>
            <Link to="/how-it-works" className="btn-secondary px-6 py-3 text-lg font-semibold">Explore Platform</Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
