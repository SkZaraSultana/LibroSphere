import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import toast from 'react-hot-toast'
import { fetchAnalytics } from '../../services/analyticsService'

const statusColors = {
  Borrowed: '#4f46e5',
  Returned: '#10b981',
  Overdue: '#f59e0b',
}

const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6']

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  )
}

function DataRow({ rank, title, author, count }) {
  return (
    <div className="grid grid-cols-[40px_minmax(0,_1fr)_140px] items-center gap-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] p-4 transition hover:border-[var(--color-primary)]">
      <div className="text-lg font-semibold text-[var(--color-primary)]">#{rank}</div>
      <div>
        <p className="font-semibold text-[var(--color-text)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--color-text-2)]">{author}</p>
      </div>
      <div className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">{count} Borrows</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center text-[var(--color-text-2)] shadow-sm">
      <div className="text-5xl">📊</div>
      <p className="mt-4 text-xl font-semibold text-[var(--color-text)]">No analytics available yet.</p>
      <p className="mt-2 max-w-xl mx-auto">Start adding books, registering members and issuing books to generate analytics.</p>
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetchAnalytics()
      setData(response)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
    const interval = setInterval(loadAnalytics, 5000)
    return () => clearInterval(interval)
  }, [])

  const hasAnalytics = useMemo(() => {
    if (!data) return false
    return data.summary?.totalBooks || data.summary?.totalMembers || data.summary?.totalBorrows || data.summary?.overdueBooks
  }, [data])

  const bookCategoryData = useMemo(() => data?.bookByCategory || [], [data])
  const statusData = useMemo(() => data?.statusDistribution || [], [data])
  const monthlyData = useMemo(() => data?.monthlyActivity || [], [data])
  const topAuthors = useMemo(() => data?.topAuthors || [], [data])
  const mostBorrowed = useMemo(() => data?.mostBorrowed || [], [data])
  const availability = useMemo(() => data?.availability || { availableBooks: 0, issuedBooks: 0 }, [data])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Analytics</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Visual insights into your library operations.</h1>
        </div>
      </div>

      {!hasAnalytics ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Total Books" value={data.summary.totalBooks} />
            <SummaryCard title="Total Members" value={data.summary.totalMembers} />
            <SummaryCard title="Total Borrows" value={data.summary.totalBorrows} />
            <SummaryCard title="Overdue Books" value={data.summary.overdueBooks} />
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Books by Category</h2>
              </div>
              <div className="mt-5 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookCategoryData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-2)' }} />
                    <YAxis tick={{ fill: 'var(--color-text-2)' }} />
                    <Tooltip wrapperStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.15)', background: 'var(--color-card)' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Borrow Status Distribution</h2>
              </div>
              <div className="mt-5 flex h-[320px] items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={statusColors[entry.name] || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.15)', background: 'var(--color-card)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Monthly Library Activity</h2>
              </div>
              <div className="mt-5 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--color-text-2)' }} />
                    <YAxis tick={{ fill: 'var(--color-text-2)' }} />
                    <Tooltip wrapperStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.15)', background: 'var(--color-card)' }} />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="borrowed" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="returned" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Book Availability</h2>
              </div>
              <div className="mt-5 h-[380px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Available', value: availability.availableBooks }, { name: 'Issued', value: availability.issuedBooks }]} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                      <Cell fill="#10b981" />
                      <Cell fill="#4f46e5" />
                    </Pie>
                    <Tooltip wrapperStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.15)', background: 'var(--color-card)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Top Authors</h2>
              </div>
              <div className="mt-5 h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topAuthors} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                    <XAxis type="number" tick={{ fill: 'var(--color-text-2)' }} />
                    <YAxis dataKey="author" type="category" width={160} tick={{ fill: 'var(--color-text-2)' }} />
                    <Tooltip wrapperStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.15)', background: 'var(--color-card)' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[12, 12, 12, 12]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-5 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Most Borrowed Books</h2>
              </div>
              <div className="mt-5 space-y-3">
                {mostBorrowed.length === 0 ? (
                  <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-center text-[var(--color-text-2)]">No data available.</div>
                ) : (
                  mostBorrowed.map((book, index) => (
                    <DataRow key={book.title || index} rank={index + 1} title={book.title || 'Untitled'} author={book.author || 'Unknown'} count={book.count || 0} />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
