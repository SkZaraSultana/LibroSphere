import React from 'react'
import { motion } from 'framer-motion'

export default function FeatureCard({ icon, title, description }) {
  return (
    <motion.article whileHover={{ y: -8 }} transition={{ duration: 0.28 }} className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[0_18px_50px_rgba(75,53,42,0.06)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-[var(--color-text)] text-lg font-semibold">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold" style={{ fontFamily: 'Poppins', color:'var(--color-text)' }}>{title}</h3>
      <p className="mt-3 text-[var(--color-text-2)]">{description}</p>
    </motion.article>
  )
}
