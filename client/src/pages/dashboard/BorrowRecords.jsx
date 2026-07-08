import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiPlus, FiSearch, FiCalendar, FiUser, FiBookOpen, FiClock, FiCheckCircle } from 'react-icons/fi'
import Modal from '../../components/Modal'
import PrimaryButton from '../../components/auth/PrimaryButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import { fetchLoans, issueLoan, returnLoan } from '../../services/loanService'
import { fetchMembers } from '../../services/memberService'
import { fetchBooks } from '../../services/bookService'

function formatDateShort(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysOverdue(dueDate) {
  if (!dueDate) return 0
  const now = new Date()
  const due = new Date(dueDate)
  const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

export default function BorrowRecords() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ borrowed: 0, returnedToday: 0, overdue: 0, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])

  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [issueForm, setIssueForm] = useState({ book: '', member: '', borrowDate: new Date().toISOString().slice(0, 10), dueDate: '' })
  const [issueErrors, setIssueErrors] = useState({})
  const [confirmReturn, setConfirmReturn] = useState(null)

  const loadLoans = async () => {
    setLoading(true)
    try {
      const q = search.trim() || undefined
      const status = statusFilter === 'all' ? undefined : statusFilter === 'overdue' ? 'overdue' : statusFilter
      const res = await fetchLoans({ q, status, sort: sortBy, page, limit })
      const data = Array.isArray(res?.data) ? res.data : []
      // only update if changed to avoid blinking
      try {
        if (JSON.stringify(loans) !== JSON.stringify(data)) setLoans(data)
      } catch (e) {
        setLoans(data)
      }
    } catch (err) {
      toast.error('Unable to load borrow records')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [borrowedRes, returnedTodayRes, overdueRes, totalRes] = await Promise.all([
        fetchLoans({ status: 'borrowed', page: 1, limit: 1 }),
        fetchLoans({ status: 'returnedToday', page: 1, limit: 1 }),
        fetchLoans({ status: 'overdue', page: 1, limit: 1 }),
        fetchLoans({ page: 1, limit: 1 }),
      ])
      const newStats = { borrowed: Number(borrowedRes?.totalCount || 0), returnedToday: Number(returnedTodayRes?.totalCount || 0), overdue: Number(overdueRes?.totalCount || 0), total: Number(totalRes?.totalCount || 0) }
      try {
        if (JSON.stringify(stats) !== JSON.stringify(newStats)) setStats(newStats)
      } catch (e) {
        setStats(newStats)
      }
    } catch (err) {
      // ignore
    }
  }

  const loadMembersAndBooks = async () => {
    try {
      const [memRes, bookRes] = await Promise.all([fetchMembers({ page: 1, limit: 1000 }), fetchBooks({ page: 1, limit: 1000 })])
      const newMembers = Array.isArray(memRes?.data) ? memRes.data : []
      const prevMembers = JSON.stringify(members || [])
      const nextMembers = JSON.stringify(newMembers || [])
      if (prevMembers !== nextMembers) setMembers(newMembers)

      const allBooks = Array.isArray(bookRes?.data) ? bookRes.data : []
      try {
        const prevBooks = JSON.stringify(books || [])
        const nextBooks = JSON.stringify(allBooks || [])
        if (prevBooks !== nextBooks) setBooks(allBooks)
      } catch (e) {
        setBooks(allBooks)
      }
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    loadMembersAndBooks()
    loadLoans()
    loadStats()
    // poll stats and list periodically
    const id = setInterval(() => {
      loadLoans()
      loadStats()
    }, 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      loadLoans()
      loadStats()
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, sortBy])

  const availableBooks = useMemo(() => books.filter((b) => Number(b.availableCopies || 0) > 0), [books])

  const canIssue = members.length > 0 && availableBooks.length > 0

  const openIssue = () => {
    setIssueForm({ book: availableBooks[0]?._id || '', member: members[0]?._id || '', borrowDate: new Date().toISOString().slice(0, 10), dueDate: '' })
    setIssueErrors({})
    setIsIssueOpen(true)
  }

  const handleIssue = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!issueForm.book) errors.book = 'Book is required'
    if (!issueForm.member) errors.member = 'Member is required'
    if (!issueForm.dueDate) errors.dueDate = 'Due date is required'
    if (issueForm.dueDate && new Date(issueForm.dueDate) < new Date(issueForm.borrowDate)) errors.dueDate = 'Due date cannot be before borrow date'
    setIssueErrors(errors)
    if (Object.keys(errors).length) return

    try {
      // validation: ensure member does not already have this book active
      const existing = await fetchLoans({ member: issueForm.member, book: issueForm.book, status: 'borrowed', page: 1, limit: 1 })
      if (existing?.totalCount > 0) {
        toast.error('This member already has this book issued.')
        return
      }

      await issueLoan({ book: issueForm.book, member: issueForm.member, dueAt: issueForm.dueDate })
      toast.success('Book issued successfully')
      setIsIssueOpen(false)
      loadLoans()
      loadStats()
      loadMembersAndBooks()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to issue book')
    }
  }

  const confirmReturnLoan = (loan) => setConfirmReturn(loan)

  const handleReturn = async () => {
    if (!confirmReturn) return
    try {
      await returnLoan(confirmReturn._id)
      toast.success('Book returned')
      setConfirmReturn(null)
      loadLoans()
      loadStats()
      loadMembersAndBooks()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to return book')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Borrow Records</p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Issue books and manage library borrowings.</h1>
          </div>
          <button onClick={openIssue} disabled={!canIssue} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50">
            <FiPlus size={16} /> Issue Book
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Currently Borrowed</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.borrowed}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Returned Today</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.returnedToday}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Overdue Books</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.overdue}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Total Borrow Records</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{stats.total}</p>
        </div>
      </div>

      {/* Warning banner */}
      {members.length === 0 || availableBooks.length === 0 ? (
        <div className="rounded-[20px] border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">{
          members.length === 0 ? '⚠ No members registered.' : !availableBooks.length ? '⚠ No books available for borrowing.' : ''
        }</div>
      ) : null}

      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="flex items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 shadow-sm">
              <FiSearch className="text-[var(--color-primary)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by book title, member name or membership ID" className="w-full border-0 bg-transparent text-sm outline-none" />
            </label>
          </div>
          <div className="mt-2 flex gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="dueDate">Due Date</option>
              <option value="returnDate">Return Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-text-2)]">
              <th className="py-2">Book</th>
              <th className="py-2">Member</th>
              <th className="py-2">Borrow Date</th>
              <th className="py-2">Due Date</th>
              <th className="py-2">Return Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-6 text-center">Loading…</td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center">📚 No borrow records yet. Issue your first book to begin tracking library borrowings.</td></tr>
            ) : loans.map((loan) => {
              const isOverdue = !loan.returnedAt && loan.dueAt && new Date(loan.dueAt) < new Date()
              return (
                <tr key={loan._id} className="border-t border-[var(--color-border)]">
                  <td className="py-3 align-top">
                    <div className="font-semibold text-[var(--color-text)]">{loan.book?.title || '—'}</div>
                    <div className="text-[var(--color-text-2)]">{loan.book?.author || ''}</div>
                  </td>
                  <td className="py-3 align-top">
                    <div className="font-semibold">{loan.member?.fullName || '—'}</div>
                    <div className="text-[var(--color-text-2)]">{loan.member?.membershipId || '—'}</div>
                  </td>
                  <td className="py-3 align-top">{formatDateShort(loan.borrowedAt)}</td>
                  <td className={`py-3 align-top ${isOverdue ? 'text-red-600' : ''}`}>
                    <div>{formatDateShort(loan.dueAt)}</div>
                    {isOverdue ? <div className="text-sm text-red-600">{daysOverdue(loan.dueAt)} days overdue</div> : null}
                  </td>
                  <td className="py-3 align-top">{loan.returnedAt ? formatDateShort(loan.returnedAt) : '—'}</td>
                  <td className="py-3 align-top">
                    {loan.status === 'borrowed' && <span className="rounded-full bg-yellow-100 px-3 py-1 text-[var(--color-text)]">Borrowed</span>}
                    {loan.status === 'returned' && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Returned</span>}
                    {isOverdue && <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Overdue</span>}
                  </td>
                  <td className="py-3 align-top">
                    {loan.status === 'borrowed' ? (
                      <button onClick={() => confirmReturnLoan(loan)} className="rounded-full bg-[var(--color-background)] px-3 py-2 text-sm">🔄 Return Book</button>
                    ) : (
                      <button onClick={() => toast.info('View not implemented')} className="rounded-full bg-[var(--color-background)] px-3 py-2 text-sm">👁 View</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={isIssueOpen} onClose={() => setIsIssueOpen(false)} title="Issue Book">
        <form onSubmit={handleIssue} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-2)]">Book *</label>
            <select value={issueForm.book} onChange={(e) => setIssueForm((p) => ({ ...p, book: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none">
              <option value="">Select a book</option>
              {availableBooks.map((b) => (
                <option key={b._id} value={b._id}>{b.title} — Available: {b.availableCopies} of {b.copies}</option>
              ))}
            </select>
            {issueErrors.book && <p className="mt-2 text-xs text-red-500">{issueErrors.book}</p>}
          </div>

          <div>
            <label className="block text-sm text-[var(--color-text-2)]">Member *</label>
            <select value={issueForm.member} onChange={(e) => setIssueForm((p) => ({ ...p, member: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none">
              <option value="">Select a member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName} — {m.membershipId}</option>
              ))}
            </select>
            {issueErrors.member && <p className="mt-2 text-xs text-red-500">{issueErrors.member}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[var(--color-text-2)]">Borrow Date</label>
              <input type="date" value={issueForm.borrowDate} onChange={(e) => setIssueForm((p) => ({ ...p, borrowDate: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-2)]">Due Date *</label>
              <input type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm((p) => ({ ...p, dueDate: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none" />
              {issueErrors.dueDate && <p className="mt-2 text-xs text-red-500">{issueErrors.dueDate}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            {[7,14,21,30].map((d) => (
              <button key={d} type="button" onClick={() => {
                const dt = new Date()
                dt.setDate(dt.getDate() + d)
                setIssueForm((p) => ({ ...p, dueDate: dt.toISOString().slice(0,10) }))
              }} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm">{d} Days</button>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
            <button type="button" onClick={() => setIsIssueOpen(false)} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm">Cancel</button>
            <PrimaryButton type="submit">Issue Book</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(confirmReturn)} title="Return Book" message={`Mark this book as returned?`} onConfirm={handleReturn} onClose={() => setConfirmReturn(null)} loading={false} />
    </motion.div>
  )
}
