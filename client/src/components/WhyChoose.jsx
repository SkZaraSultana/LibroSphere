import React from 'react'
import { motion } from 'framer-motion'

const points = [
  'Reduce paperwork and manual tracking',
  'Easily manage inventory and copies',
  'Prevent book loss with accountability',
  'Track due dates and late returns',
  'Generate reports instantly',
  'Increase librarian productivity',
  'Secure cloud storage and backups',
  'Professional analytics-ready dashboard',
]

export default function WhyChoose() {
  return (
    <section className="py-16 bg-gradient-to-b from-transparent to-white/50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4" style={{fontFamily:'Poppins'}}>Why Choose LibroSphere</h2>
            <p className="text-gray-600 mb-6">Built for institutions of all sizes, LibroSphere centralizes library operations and gives librarians the tools they need to operate efficiently.</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {points.map((p) => (
                <motion.li key={p} whileHover={{ x: 4 }} className="p-3 bg-white border border-border rounded-xl">{p}</motion.li>
              ))}
            </ul>
          </div>

          <div>
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="font-semibold mb-3">Trusted Features</h4>
              <p className="text-sm text-gray-600">Secure authentication, role-based access, reliable backups and scalable architecture ensure your data remains protected and accessible.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
