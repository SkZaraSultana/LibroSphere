import React, { useEffect, useMemo, useState } from 'react'
import { FiBookOpen, FiUsers, FiRefreshCcw, FiBook, FiArrowUpRight, FiAlertTriangle, FiTag, FiUserPlus, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { fetchOverview } from '../../services/dashboardService'
import AnimatedCounter from '../../components/AnimatedCounter'

const formatDateTime = (value) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const activityIcons = {
  'book-borrowed': <FiBook size={18} />,
  'book-returned': <FiArrowUpRight size={18} />,
  'book-added': <FiBookOpen size={18} />,
  'member-registered': <FiUserPlus size={18} />,
}

const actionCards = [
  {
    label: 'Manage Books',
    description: 'Browse, update, and organize your library catalog.',
    icon: <FiBookOpen size={20} />,
    to: '/dashboard/books',
  },
  {
    label: 'Categories',
    description: 'Review and maintain your collection categories.',
    icon: <FiTag size={20} />,
    to: '/dashboard/categories',
  },
  {
    label: 'Members',
    description: 'Manage registered members and their accounts.',
    icon: <FiUsers size={20} />,
    to: '/dashboard/members',
  },
  {
    label: 'Issue Book',
    description: 'Record a new borrow and track due dates.',
    icon: <FiBook size={20} />,
    to: '/dashboard/borrow-records',
  },
]

export default function DashboardHome() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOverview = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const data = await fetchOverview()
      setOverview(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load overview statistics')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
    const interval = window.setInterval(() => loadOverview(true), 15000)
    const handleFocus = () => loadOverview(true)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const recentActivities = useMemo(() => {
    if (!overview?.recentActivity?.length) return []
    return overview.recentActivity
      .filter((item) => ['book-borrowed', 'book-returned', 'book-added', 'member-registered'].includes(item.type))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
  }, [overview])

  const statCards = useMemo(() => [
    {
      title: 'Total Books',
      value: overview?.totalBooks ?? 0,
      description: 'Books currently in catalog',
      icon: <FiBookOpen size={20} />,
    },
    {
      title: 'Available Books',
      value: overview?.availableBooks ?? 0,
      description: 'Books ready to be issued',
      icon: <FiBook size={20} />,
    },
    {
      title: 'Issued Books',
      value: overview?.borrowedBooks ?? 0,
      description: 'Books currently on loan',
      icon: <FiArrowUpRight size={20} />,
    },
    {
      title: 'Returned Books',
      value: overview?.returnedToday ?? 0,
      description: 'Books returned today',
      icon: <FiRefreshCcw size={20} />,
    },
    {
      title: 'Total Members',
      value: overview?.totalMembers ?? 0,
      description: 'Registered library members',
      icon: <FiUsers size={20} />,
    },
    {
      title: 'Overdue Books',
      value: overview?.overdueBooks ?? 0,
      description: 'Books past their due date',
      icon: <FiAlertTriangle size={20} />,
    },
  ], [overview])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm animate-pulse">Loading dashboard...</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-36 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 p-8 shadow-sm">
        <p className="text-lg font-semibold text-red-700">Unable to load dashboard</p>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button onClick={() => loadOverview()} className="mt-4 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Dashboard Overview</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">Welcome back! Here's a quick overview of your library today.</h1>
          </div>
          <button onClick={() => loadOverview()} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:-translate-y-0.5 hover:bg-[var(--color-card)]">
            <FiRefreshCcw size={16} /> Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.title} className="group rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {card.icon}
            </div>
            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">{card.title}</p>
              <p className="mt-4 text-4xl font-semibold text-[var(--color-text)]">{card.value.toLocaleString()}</p>
              <p className="mt-3 text-sm text-[var(--color-text-2)]">{card.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Quick Actions</p>
              <p className="mt-2 text-sm text-[var(--color-text-2)]">Frequently used library operations</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {actionCards.map((action) => (
              <button key={action.label} onClick={() => navigate(action.to)} className="group rounded-[20px] border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:bg-[var(--color-card)]">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{action.icon}</div>
                <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">{action.label}</p>
                <p className="mt-1 text-sm text-[var(--color-text-2)]">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Recent Activity</p>
            <p className="mt-2 text-sm text-[var(--color-text-2)]">Latest actions performed in your library</p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8 text-center">
              <div className="text-3xl">📭</div>
              <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">No recent activity yet.</p>
              <p className="mt-2 text-sm text-[var(--color-text-2)]">Activity will appear here after books, members and loans are created.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {recentActivities.map((activity) => (
                <div key={`${activity.type}-${activity.date}`} className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{activityIcons[activity.type] || <FiClock size={18} />}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{activity.title}</p>
                        <span className="text-xs text-[var(--color-text-2)]">{formatDateTime(activity.date)}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-text-2)]">{activity.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
