import React, { useEffect, useState, useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/how-it-works', label: 'How It Works' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 18)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-[var(--color-highlight)]/90 border-b' : 'bg-[var(--color-highlight)]/95'}`}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3 text-lg font-black tracking-tight">
          <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-base text-white shadow-md">
            LS
          </span>
          <span className="text-2xl font-black text-[var(--color-text)]">
            LibroSphere
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `relative text-sm font-medium transition ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-2)] hover:text-[var(--color-primary)]'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-2 text-sm font-medium text-[var(--color-text-2)] transition hover:border-[var(--color-primary)]">
                Login
              </Link>
              <Link to="/register" className="rounded-full btn-primary px-6 py-2.5 text-sm font-semibold">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-2 text-sm font-medium text-[var(--color-text-2)] transition hover:border-[var(--color-primary)]">
                Dashboard
              </Link>
              <button onClick={() => { logout(); navigate('/') }} className="rounded-full btn-secondary px-6 py-2.5 text-sm font-semibold">
                Logout
              </button>
            </>
          )}
        </div>

        <button className="md:hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-2 text-[var(--color-text-2)] shadow-sm" onClick={() => setOpen((p) => !p)} aria-label="Toggle mobile menu">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-2xl shadow-lg">
          <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
            <div className="space-y-3">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={({ isActive }) => `block rounded-3xl px-4 py-3 text-base font-medium transition ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text-2)] hover:bg-[var(--color-card)]'}`}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              <Link to="/login" onClick={() => setOpen(false)} className="block rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text-2)]">
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block rounded-full btn-primary px-4 py-3 text-center text-sm font-semibold text-white">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
