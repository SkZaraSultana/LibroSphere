import React from 'react'
import { motion } from 'framer-motion'

export default function TestimonialCard({ quote, name, role }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
      <p className="text-[var(--color-text-2)]">“{quote}”</p>
      <div className="mt-4">
        <p className="font-semibold text-[var(--color-text)]">{name}</p>
        <p className="text-sm text-[var(--color-text-2)]">{role}</p>
      </div>
    </motion.article>
  )
}
