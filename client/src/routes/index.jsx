import React from 'react'
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

// Central route registry. Keeps routing organized and easy to read.
const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/how-it-works', element: <HowItWorks /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Dashboard nested routes use a layout wrapper
  { path: '/dashboard/*', element: <DashboardLayout /> },
]

export default routes
