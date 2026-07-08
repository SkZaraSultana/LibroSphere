import React from 'react'
import { motion } from 'framer-motion'

const faqs = [
  { q: 'Is LibroSphere suitable for small libraries?', a: 'Yes — LibroSphere scales from small community libraries to large university systems. Choose the plan that suits your size.' },
  { q: 'How secure is my data?', a: 'We use JWT authentication, role-based access controls, and encrypted backups in production deployments.' },
  { q: 'Can I import existing catalogs?', a: 'Yes — import tools support CSV and common catalog formats to ease migration.' },
  { q: 'Does LibroSphere support multiple branches?', a: 'Yes — branch-level inventory tracking and permissions are supported.' },
]

export default function FAQ(){
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6" style={{fontFamily:'Poppins'}}>Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map(f => (
            <motion.div key={f.q} initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="p-4 bg-white border border-border rounded-xl">
              <h4 className="font-semibold">{f.q}</h4>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
