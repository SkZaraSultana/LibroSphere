import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiBookOpen, FiSearch, FiCalendar, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi'
import Modal from '../../components/Modal'
import { fetchLoans } from '../../services/loanService'

function formatDateShort(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysBetween(start, end) {
  if (!start || !end) return '—'
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24))
  return `${diff} Days`
}

export default function Returns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('returnDate')
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, recentTitle: '-' })
  const [page] = useState(1)
  const [limit] = useState(1000)
  const [viewItem, setViewItem] = useState(null)

  const loadReturns = async () => {
    setLoading(true)
    try {
      const status = 'returned'
      let statusParam = undefined
      if (filter === 'today') statusParam = 'returnedToday'
      if (filter === 'week') statusParam = 'returnedWeek'
      if (filter === 'month') statusParam = 'returnedMonth'

      const res = await fetchLoans({ q: search || undefined, status: statusParam || status, sort: sortBy, page, limit })
      const data = Array.isArray(res?.data) ? res.data : []
      try {
        if (JSON.stringify(returns || []) !== JSON.stringify(data || [])) setReturns(data)
      } catch (e) {
        setReturns(data)
      }

      // stats
      const total = Number(res?.totalCount || data.length) || 0
      const todayRes = await fetchLoans({ status: 'returnedToday', page: 1, limit: 1 })
      const weekRes = await fetchLoans({ status: 'returnedWeek', page: 1, limit: 1 })
      const recentTitle = data[0]?.book?.title || '-'
      const newStats = { total, today: Number(todayRes?.totalCount || 0), week: Number(weekRes?.totalCount || 0), recentTitle }
      try {
        if (JSON.stringify(stats) !== JSON.stringify(newStats)) setStats(newStats)
      } catch (e) {
        setStats(newStats)
      }
    } catch (err) {
      toast.error('Unable to load returns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReturns()
    const id = setInterval(loadReturns, 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter, sortBy])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Returns</p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">View all returned books history.</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Total Returns</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.total}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Returned Today</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.today}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Returned This Week</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.week}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Most Recently Returned</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.recentTitle || '-'}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="flex items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 shadow-sm">
              <FiSearch className="text-[var(--color-primary)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by book title, author, member name or membership ID" className="w-full border-0 bg-transparent text-sm outline-none" />
            </label>
          </div>
          <div className="mt-2 flex gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none">
              <option value="returnDate">Latest Returns</option>
              <option value="oldest">Oldest Returns</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-sm">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/70 px-6 py-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <FiBookOpen size={24} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[var(--color-text)]">No returned books yet.</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-2)]">Returned books will appear here once books are returned.</p>
            <a href="/dashboard/borrow" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition">Go to Borrow Records</a>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {returns.map((r) => (
            <div key={r._id} className="group rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm transition hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><FiCheckCircle /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--color-text)]">{r.book?.title || '—'}</div>
                  <div className="text-sm text-[var(--color-text-2)]">{r.book?.author || ''}</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-[var(--color-text-2)]">
                <div className="flex items-center gap-2"><FiUser /> <span className="font-semibold">Returned By:</span> <span>{r.member?.fullName || '—'}</span></div>
                <div className="mt-1 text-xs text-[var(--color-text-2)]">{r.member?.membershipId || '—'}</div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[var(--color-text-2)]">
                <div>
                  <p className="text-xs">Borrow Date</p>
                  <p className="mt-1 text-[var(--color-text)]">{formatDateShort(r.borrowedAt)}</p>
                </div>
                <div>
                  <p className="text-xs">Return Date</p>
                  <p className="mt-1 text-[var(--color-text)]">{formatDateShort(r.returnedAt)}</p>
                </div>
              </div>

              <div className="mt-3 text-sm text-[var(--color-text-2)]">
                <p className="text-xs">Borrow Duration</p>
                <p className="mt-1 text-[var(--color-text)]">{daysBetween(r.borrowedAt, r.returnedAt)}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 text-sm">Returned Successfully</span>
                <button onClick={() => setViewItem(r)} className="text-sm text-[var(--color-primary)]">👁 View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(viewItem)} onClose={() => setViewItem(null)} title="Return Details">
        {viewItem && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Book</p>
              <p className="mt-2 text-[var(--color-text)] font-semibold">{viewItem.book?.title}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Author</p>
              <p className="mt-2 text-[var(--color-text)] font-semibold">{viewItem.book?.author}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Member</p>
              <p className="mt-2 text-[var(--color-text)] font-semibold">{viewItem.member?.fullName} · {viewItem.member?.membershipId}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Borrow Date</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{formatDateShort(viewItem.borrowedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Due Date</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{formatDateShort(viewItem.dueAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Return Date</p>
              <p className="mt-2 text-[var(--color-text)] font-semibold">{formatDateShort(viewItem.returnedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Borrow Duration</p>
              <p className="mt-2 text-[var(--color-text)] font-semibold">{daysBetween(viewItem.borrowedAt, viewItem.returnedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Description</p>
              <p className="mt-2 text-[var(--color-text)]">{viewItem.notes || '—'}</p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
