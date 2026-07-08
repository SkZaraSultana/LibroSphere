import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PublicLayout from '../layouts/PublicLayout'
import Home from '../pages/Home'
import About from '../pages/About'
import HowItWorks from '../pages/HowItWorks'
import Login from '../pages/Login'
import Register from '../pages/Register'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardHome from '../pages/dashboard/DashboardHome'
import Books from '../pages/dashboard/Books'
import Categories from '../pages/dashboard/Categories'
import Members from '../pages/dashboard/Members'
import BorrowRecords from '../pages/dashboard/BorrowRecords'
import Returns from '../pages/dashboard/Returns'
import Reports from '../pages/dashboard/Reports'
import Analytics from '../pages/dashboard/Analytics'
import Profile from '../pages/dashboard/Profile'
import Settings from '../pages/dashboard/Settings'
import ProtectedRoute from '../components/ProtectedRoute'
import ScrollToTop from '../utils/ScrollToTop'

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="overflow-hidden"
  >
    {children}
  </motion.div>
)

export default function AppRoutes() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="how-it-works" element={<PageWrapper><HowItWorks /></PageWrapper>} />
            <Route path="login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="register" element={<PageWrapper><Register /></PageWrapper>} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="books" element={<Books />} />
            <Route path="categories" element={<Categories />} />
            <Route path="members" element={<Members />} />
            <Route path="borrow-records" element={<BorrowRecords />} />
            <Route path="returns" element={<Returns />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  )
}
