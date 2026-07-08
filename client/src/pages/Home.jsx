import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import CTA from '../components/CTA'
import api from '../services/api'
import { FiBookOpen, FiUsers, FiRepeat, FiBox, FiBarChart2, FiShield, FiSearch, FiSmartphone, FiCheck } from 'react-icons/fi'

const features = [
  { icon: <FiBookOpen size={22} />, title: 'Book Management', description: 'Organize collections, editions, and digital catalogs in one place.' },
  { icon: <FiUsers size={22} />, title: 'Member Management', description: 'Track borrowers, memberships, and communication history.' },
  { icon: <FiRepeat size={22} />, title: 'Borrow & Return', description: 'Streamline loan cycles with clear due dates and status tracking.' },
  { icon: <FiBox size={22} />, title: 'Inventory Tracking', description: 'Monitor stock, locations, and availability in real time.' },
  { icon: <FiBarChart2 size={22} />, title: 'Analytics Dashboard', description: 'Align operations with usage trends and retention metrics.' },
  { icon: <FiShield size={22} />, title: 'Secure Authentication', description: 'Protect your library with secure access controls and sessions.' },
  { icon: <FiSearch size={22} />, title: 'Real-Time Search', description: 'Find books, members, and history instantly from any screen.' },
  { icon: <FiSmartphone size={22} />, title: 'Responsive Design', description: 'Access the platform on desktop, tablet, and mobile devices.' },
]

const whyCards = [
  { icon: <FiBookOpen size={20} />, title: 'Book Management', copy: 'Add, edit, search and organize books with complete inventory control.' },
  { icon: <FiUsers size={20} />, title: 'Member Management', copy: 'Maintain member records, borrowing history and profile information.' },
  { icon: <FiRepeat size={20} />, title: 'Borrow & Return Tracking', copy: 'Issue books, manage due dates and automatically update inventory.' },
  { icon: <FiBarChart2 size={20} />, title: 'Reports & Analytics', copy: 'View borrowing trends, inventory insights and activity reports generated from real database data.' },
  { icon: <FiShield size={20} />, title: 'Secure Authentication', copy: 'JWT-based login with encrypted passwords using bcrypt.' },
  { icon: <FiSmartphone size={20} />, title: 'Responsive Dashboard', copy: 'Works seamlessly on desktop, laptop, tablet and mobile devices.' },
]

const howHelps = [
  'Reduce manual paperwork.',
  'Keep book inventory organized.',
  'Track issued and returned books accurately.',
  'Access library information anytime through a centralized dashboard.',
]

const projectHighlights = [
  'Built using MERN Stack',
  'JWT Authentication',
  'MongoDB Database',
  'Real-Time Dashboard',
  'CRUD Operations',
  'Responsive UI',
  'Search & Filtering',
  'Professional Reports',
]

function LiveDashboardPreview() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    returnedBooks: 0,
    registeredMembers: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      // Try a single /api/stats endpoint first
      try {
        const res = await api.get('/stats')
        if (res.status >= 200 && res.status < 300) {
          const data = res.data
          if (!cancelled) {
            setStats({
              totalBooks: Number(data.totalBooks) || Number(data.total) || 0,
              availableBooks: Number(data.availableBooks) || Number(data.available) || 0,
              issuedBooks: Number(data.issuedBooks) || Number(data.issued) || 0,
              returnedBooks: Number(data.returnedBooks) || Number(data.returned) || 0,
              registeredMembers: Number(data.registeredMembers) || Number(data.members) || Number(data.users) || 0,
            })
            return
          }
        }
      } catch (e) {
        // ignore and fallback
      }

      // Fallback: try individual endpoints. If endpoint returns array, use length. If returns object with count, use it.
      async function tryCount(paths) {
        for (const p of paths) {
          try {
            const r = await api.get(p)
            if (r.status < 200 || r.status >= 300) continue
            const j = r.data
            if (Array.isArray(j)) return j.length
            if (typeof j === 'number') return j
            if (j && typeof j.count === 'number') return j.count
            if (j && typeof j.total === 'number') return j.total
            if (j && typeof j.length === 'number') return j.length
          } catch (e) {
            continue
          }
        }
        return 0
      }

      const [totalBooks, availableBooks, issuedBooks, returnedBooks, registeredMembers] = await Promise.all([
        tryCount(['/books', '/books/all', '/book', '/library/books']),
        tryCount(['/books/available', '/books?status=available']),
        tryCount(['/loans', '/borrowings', '/issued']),
        tryCount(['/books/returned', '/returns']),
        tryCount(['/members', '/users', '/members/list']),
      ])

      if (!cancelled) setStats({ totalBooks, availableBooks, issuedBooks, returnedBooks, registeredMembers })
    }

    fetchStats()
    const t = setInterval(fetchStats, 15000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  const items = [
    { title: 'Total Books', key: 'totalBooks' },
    { title: 'Available Books', key: 'availableBooks' },
    { title: 'Issued Books', key: 'issuedBooks' },
    { title: 'Returned Books', key: 'returnedBooks' },
    { title: 'Registered Members', key: 'registeredMembers' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      {items.map((it) => (
        <div key={it.key} className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-2)]">{it.title}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{stats[it.key] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="space-y-24">
      <Hero />

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Platform features</p>
          <h2 className="mt-6 text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl" style={{ fontFamily: 'Poppins' }}>
            Everything a modern library needs.
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--color-text-2)]">
            A premium SaaS experience designed to help libraries manage books, members, lending, inventory, analytics, and security through one cohesive platform.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Why LibroSphere?</p>
          <h2 className="mt-6 text-3xl font-bold leading-tight text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>A complete platform built for modern library operations</h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyCards.map((c) => (
            <FeatureCard key={c.title} icon={c.icon} title={c.title} description={c.copy} />
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Live Dashboard Preview</h3>
          <p className="mt-2 text-sm text-[var(--color-text-2)]">Counts update automatically from the database when records exist. Shows 0 when empty.</p>
          <LiveDashboardPreview />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">How LibroSphere Helps Libraries</p>
          <h2 className="mt-6 text-3xl font-bold leading-tight text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>
            Practical benefits for day-to-day operations
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howHelps.map((t) => (
            <div key={t} className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-[var(--color-text-2)] shadow-sm">
              <p className="font-semibold text-[var(--color-text)]">{t}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Project Highlights</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {projectHighlights.map((h) => (
              <div key={h} className="flex items-center gap-3 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
                <span className="rounded-full bg-[var(--color-primary)] p-2 text-white"><FiCheck size={16} /></span>
                <span className="text-[var(--color-text)]">{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-8">
          <h3 className="text-xl font-semibold text-[var(--color-text)]">Why This Project?</h3>
          <p className="mt-4 text-[var(--color-text-2)]">LibroSphere is a complete Full Stack MERN application developed to simplify library operations through one centralized platform.</p>
          <ul className="mt-4 list-disc pl-5 text-[var(--color-text-2)] space-y-2">
            <li>React for building reusable user interfaces.</li>
            <li>Express.js for REST APIs.</li>
            <li>Node.js for backend execution.</li>
            <li>MongoDB for storing application data.</li>
            <li>JWT Authentication for secure access.</li>
            <li>Responsive design for every device.</li>
          </ul>
          <p className="mt-4 text-[var(--color-text-2)]">This project is designed as a production-style application and showcases real CRUD operations, authentication, inventory management, and analytics without using demo data.</p>
        </div>
      </section>

      <CTA />
    </div>
  )
}
