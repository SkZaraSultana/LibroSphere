import React from 'react'
import { motion } from 'framer-motion'
import { FiUserPlus, FiLogIn, FiGrid, FiBookOpen, FiUsers, FiBookmark, FiRepeat, FiBarChart2, FiFileText } from 'react-icons/fi'

const steps = [
  { title: 'Register', description: 'Create your administrator account and configure your library structure.', icon: <FiUserPlus /> },
  { title: 'Login', description: 'Securely access the platform using modern authentication and session management.', icon: <FiLogIn /> },
  { title: 'Dashboard', description: 'View your library health, borrowing trends, and alerts from one polished dashboard.', icon: <FiGrid /> },
  { title: 'Add Books', description: 'Add new titles, categories, and edition details with a clean interface.', icon: <FiBookOpen /> },
  { title: 'Register Members', description: 'Invite students, staff, and community members through the member directory.', icon: <FiUsers /> },
  { title: 'Issue Books', description: 'Issue books quickly while tracking due dates and borrower status.', icon: <FiBookmark /> },
  { title: 'Return Books', description: 'Process returns with clear check-in records and condition notes.', icon: <FiRepeat /> },
  { title: 'Analytics', description: 'Monitor circulation trends, most popular titles, and member engagement.', icon: <FiBarChart2 /> },
  { title: 'Reports', description: 'Create instant reports for usage, inventory, overdue items and more.', icon: <FiFileText /> },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">How it works</p>
        <h1 className="mt-6 text-3xl font-extrabold leading-tight text-[var(--color-text)] sm:text-4xl" style={{ fontFamily: 'Poppins' }}>
          A guided workflow for librarians and administrators.
        </h1>
        <p className="mt-4 mx-auto max-w-3xl text-base leading-7 text-[var(--color-text-2)]">
          Every step is designed to mirror real library operations, from account setup to analytics and reporting.
        </p>
      </div>

      <div className="mt-10 grid gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[0_30px_60px_rgba(75,53,42,0.06)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-primary)] text-white text-2xl shadow-md">
                {step.icon}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Step {index + 1}</p>
                <h2 className="mt-3 text-xl font-semibold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-2)]">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
