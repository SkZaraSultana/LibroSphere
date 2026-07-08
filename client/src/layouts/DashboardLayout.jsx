import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

// Dashboard layout with sidebar + header. Child routes render in the Outlet.
export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-background)] text-[var(--color-text)]">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
