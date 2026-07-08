import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

function useCountUp(target){
  const [value, setValue] = React.useState(0)
  React.useEffect(()=>{
    let raf;
    let start;
    const duration = 1200
    function step(timestamp){
      if(!start) start = timestamp
      const progress = Math.min((timestamp-start)/duration,1)
      setValue(Math.floor(progress * target))
      if(progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return ()=> cancelAnimationFrame(raf)
  },[target])
  return value
}

function Counter({ end, label }){
  const [ref, inView] = useInView({triggerOnce:true, threshold:0.3})
  const value = useCountUp(inView ? end : 0)
  return (
    <div ref={ref} className="p-6 glass-card rounded-2xl text-center">
      <div className="text-3xl font-bold" style={{fontFamily:'Poppins'}}>{value}</div>
      <div className="mt-2 text-sm text-gray-600">{label}</div>
    </div>
  )
}

export default function PlatformStats(){
  const stats = [
    { end: 0, label: 'Books' },
    { end: 0, label: 'Members' },
    { end: 0, label: 'Borrowed Books' },
    { end: 0, label: 'Returned Books' },
    { end: 0, label: 'Categories' },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6" style={{fontFamily:'Poppins'}}>Platform Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map(s=> <Counter key={s.label} end={s.end} label={s.label} />)}
        </div>
      </div>
    </section>
  )
}
