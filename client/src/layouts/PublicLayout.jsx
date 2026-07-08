import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PublicLayout() {
  return (
    <div className="relative overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Decorative soft background blobs */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center overflow-visible">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#F5E8D8]/30 blur-3xl" />
        <div className="absolute right-8 top-40 h-56 w-56 rounded-full bg-[#D9B382]/20 blur-3xl" />
        <div className="absolute left-1/2 top-[36rem] h-64 w-64 -translate-x-1/2 rounded-full bg-[#F2D6A2]/15 blur-3xl" />
      </div>

      <Navbar />
      <main className="pt-[72px] md:pt-[88px] lg:pt-[96px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
