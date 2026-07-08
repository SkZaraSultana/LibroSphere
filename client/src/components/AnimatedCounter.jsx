import React from 'react'

export default function AnimatedCounter({ label, value }) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    let start = null
    const duration = 900

    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)
    return () => setCount(value)
  }, [value])

  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-center shadow-sm">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-[var(--color-text)]">{count.toLocaleString()}</p>
    </div>
  )
}
