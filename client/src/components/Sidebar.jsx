import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import Modal from './Modal'
import PrimaryButton from './auth/PrimaryButton'
import { AuthContext } from '../context/AuthContext'

// Sidebar for dashboard navigation.
export default function Sidebar() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `block rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text-2)] hover:bg-[var(--color-card)]'}`

  const handleLogoutClick = () => setConfirmOpen(true)

  const handleConfirmLogout = () => {
    // Clear common auth storage, reset auth state and navigate to login
    try {
      localStorage.removeItem('librosphere_token')
      localStorage.removeItem('librosphere_user')
      sessionStorage.removeItem('librosphere_token')
    } catch (e) {
      // ignore
    }
    logout()
    setConfirmOpen(false)
    navigate('/login')
  }

  return (
    <aside className="hidden md:block w-72 shrink-0 bg-[var(--color-card)] border-r border-[var(--color-border)] shadow-sm">
      <div className="p-6 space-y-6">
        <div className="rounded-[24px] bg-[var(--color-background)] p-4 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">LibroSphere</p>
          <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">Library dashboard</p>
        </div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" end className={linkClass}>Overview</NavLink>
          <NavLink to="/dashboard/books" className={linkClass}>Books</NavLink>
          <NavLink to="/dashboard/categories" className={linkClass}>Categories</NavLink>
          <NavLink to="/dashboard/members" className={linkClass}>Members</NavLink>
          <NavLink to="/dashboard/borrow-records" className={linkClass}>Borrow Records</NavLink>
          <NavLink to="/dashboard/returns" className={linkClass}>Returns</NavLink>
          <NavLink to="/dashboard/reports" className={linkClass}>Reports</NavLink>
          <NavLink to="/dashboard/analytics" className={linkClass}>Analytics</NavLink>
          <NavLink to="/dashboard/profile" className={linkClass}>Profile</NavLink>
          <NavLink to="/dashboard/settings" className={linkClass}>Settings</NavLink>

          <div className="my-2 border-t border-[var(--color-border)]" />

          <button
            type="button"
            onClick={handleLogoutClick}
            className="block w-full text-left rounded-3xl px-4 py-3 text-sm font-medium text-[var(--color-text-2)] transition hover:bg-[var(--color-card)] hover:text-red-600"
          >
            <span className="inline-flex items-center gap-3">
              <FiLogOut />
              <span>Logout</span>
            </span>
          </button>
        </nav>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Logout">
        <div className="space-y-5">
          <p className="text-sm leading-7 text-[var(--color-text-2)]">Are you sure you want to sign out of LibroSphere?</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">
              Cancel
            </button>
            <PrimaryButton type="button" onClick={handleConfirmLogout}>
              Logout
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </aside>
  )
}
