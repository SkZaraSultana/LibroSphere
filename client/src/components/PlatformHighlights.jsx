import React from 'react'
import { motion } from 'framer-motion'
import { FiBook, FiUsers, FiRepeat, FiBox, FiBarChart2, FiShield, FiFileText, FiSmartphone } from 'react-icons/fi'

const cards = [
  { title: 'Book Management', icon: <FiBook />, desc: 'Add, categorize and manage book inventory with ease.' },
  { title: 'Member Management', icon: <FiUsers />, desc: 'Register and manage members, permissions and roles.' },
  { title: 'Borrow & Return', icon: <FiRepeat />, desc: 'Issue and return books with due-date tracking.' },
  { title: 'Inventory Tracking', icon: <FiBox />, desc: 'Track copies, locations and stock levels.' },
  { title: 'Analytics Dashboard', icon: <FiBarChart2 />, desc: 'Visualize library KPIs and trends.' },
  { title: 'Secure Authentication', icon: <FiShield />, desc: 'Role-based access and secure JWT auth.' },
  { title: 'Reports', icon: <FiFileText />, desc: 'Generate downloadable reports and exports.' },
  { title: 'Responsive Experience', icon: <FiSmartphone />, desc: 'Designed for devices of all sizes.' },
]

export default function PlatformHighlights() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6" style={{fontFamily:'Poppins'}}>Platform Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <motion.article key={c.title} whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(109,94,248,0.08)' }} className="glass-card p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{background:'linear-gradient(90deg,#6D5EF8,#B7A8FF)'}}>
                  {c.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
