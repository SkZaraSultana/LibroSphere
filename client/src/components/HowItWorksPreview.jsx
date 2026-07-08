import React from 'react'
import { motion } from 'framer-motion'
import { FiUserPlus, FiLogIn, FiLayers, FiBookOpen, FiUsers, FiBookmark, FiRepeat, FiBarChart2, FiFileText } from 'react-icons/fi'

const steps = [
  { title: 'Register', icon: <FiUserPlus /> },
  { title: 'Login', icon: <FiLogIn /> },
  { title: 'Create Categories', icon: <FiLayers /> },
  { title: 'Add Books', icon: <FiBookOpen /> },
  { title: 'Register Members', icon: <FiUsers /> },
  { title: 'Issue Books', icon: <FiBookmark /> },
  { title: 'Return Books', icon: <FiRepeat /> },
  { title: 'Dashboard Updates', icon: <FiBarChart2 /> },
  { title: 'Reports', icon: <FiFileText /> },
]

export default function HowItWorksPreview() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6" style={{fontFamily:'Poppins'}}>How LibroSphere Works</h2>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-highlight to-transparent" />
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <motion.div key={s.title} initial={{opacity:0, y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="glass-card p-4 rounded-2xl text-center">
                <div className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(90deg,#6D5EF8,#B7A8FF)', color:'white'}}>{s.icon}</div>
                <h4 className="mt-3 font-semibold">{s.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
