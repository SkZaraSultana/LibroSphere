import React from 'react'
import { motion } from 'framer-motion'

const testimonials = [
  { name: 'Aisha Khan', role: 'Head Librarian, Greenfield High', quote: 'LibroSphere transformed our circulation process. We decreased overdue returns by 42% in three months.' },
  { name: 'Dr. Miguel Santos', role: 'University Librarian, Pacifica University', quote: 'The analytics dashboard gives our staff actionable insights and saved hours of manual reporting.' },
  { name: 'Karen Osei', role: 'District Library Coordinator', quote: 'Migrating our catalog to LibroSphere was seamless and the team support was exceptional.' },
]

export default function Testimonials(){
  return (
    <section className="py-16 bg-gradient-to-b from-white to-transparent">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6" style={{fontFamily:'Poppins'}}>What Librarians Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <motion.blockquote key={t.name} initial={{opacity:0, y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="p-6 glass-card rounded-2xl">
              <p className="text-gray-700">“{t.quote}”</p>
              <footer className="mt-4 text-sm text-gray-600">— {t.name}, <span className="font-medium">{t.role}</span></footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
