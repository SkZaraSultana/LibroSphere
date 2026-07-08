import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

function Counter({ label, value }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 })
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1300
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }, [inView, value])

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center shadow-[0_18px_50px_rgba(75,53,42,0.06)]">
      <div className="text-3xl font-extrabold" style={{ fontFamily: 'Poppins', color: 'var(--color-text)' }}>{count.toLocaleString()}</div>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">{label}</p>
    </motion.div>
  )
}

export default function Stats() {
  const stats = [
    { label: 'Active Libraries', value: 1240 },
    { label: 'Members', value: 8900 },
    { label: 'Books', value: 3800 },
    { label: 'Current Loans', value: 1570 },
    { label: 'Reports Generated', value: 2840 },
  ]

  return (
    <section className="py-12">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <Counter key={item.label} {...item} />
        ))}
      </div>
    </section>
  )
}
