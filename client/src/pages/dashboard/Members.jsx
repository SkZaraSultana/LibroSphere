import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiUsers, FiBookOpen, FiClock, FiAlertCircle, FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import PrimaryButton from '../../components/auth/PrimaryButton'
import TextInput from '../../components/form/TextInput'
import TextArea from '../../components/form/TextArea'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { fetchMembers, createMember, updateMember, deleteMember } from '../../services/memberService'

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
}

const MemoizedAnimatedStatCard = React.memo(AnimatedStatCard)

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'M'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function AnimatedStatCard({ icon, title, value, description }) {
  const [count, setCount] = useState(0)
  const mounted = React.useRef(false)

  useEffect(() => {
    if (mounted.current) {
      // do not re-animate on subsequent updates
      setCount(value)
      return
    }
    mounted.current = true
    let start = null
    const duration = 800
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)
    return () => setCount(value)
  }, [value])

  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm transition duration-200 hover:shadow-md">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icon}
      </div>
      <p className="mt-5 text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{count.toLocaleString()}</p>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">{description}</p>
    </div>
  )
}

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, membersWithBorrowedBooks: 0, membersWithOverdueBooks: 0 })

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return members

    return members.filter((member) => {
      const haystack = [member.fullName, member.membershipId, member.email, member.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [members, search])

  const loadMembers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchMembers({ q: search, page: 1, limit: 1000 })
      const data = Array.isArray(response?.data) ? response.data : []

      // avoid unnecessary re-renders/blinking: only update members if payload changed
      try {
        const prev = JSON.stringify(members || [])
        const next = JSON.stringify(data || [])
        if (prev !== next) setMembers(data)
      } catch (e) {
        setMembers(data)
      }

      const membersWithBorrowedBooks = data.filter((m) => Number(m.currentBorrowedCount || 0) > 0).length
      const membersWithOverdueBooks = data.filter((m) => Number(m.overdueCount || 0) > 0).length
      const newStats = {
        totalMembers: Number(response?.totalCount || data.length) || 0,
        activeMembers: data.filter((member) => String(member.status || '').toLowerCase() === 'active').length,
        membersWithBorrowedBooks,
        membersWithOverdueBooks,
      }
      try {
        if (JSON.stringify(stats) !== JSON.stringify(newStats)) setStats(newStats)
      } catch (e) {
        setStats(newStats)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Poll for updates so members page reflects loan changes automatically.
  useEffect(() => {
    const id = setInterval(() => {
      loadMembers()
    }, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMembers()
    }, 320)
    return () => clearTimeout(timeout)
  }, [search])

  const resetForm = () => {
    setSelectedMember(null)
    setForm(initialFormState)
    setFormErrors({})
    setIsModalOpen(false)
  }

  const validateForm = () => {
    const errors = {}
    if (!form.fullName.trim()) errors.fullName = 'Full name is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    setError('')
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      }

      if (selectedMember) {
        await updateMember(selectedMember._id, payload)
        toast.success('Member updated successfully.')
      } else {
        await createMember({ ...payload, membershipId: `MEM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}` })
        toast.success('Member registered successfully.')
      }

      await loadMembers()
      resetForm()
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to save member'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setError('')
    try {
      await deleteMember(deleteTarget._id)
      toast.success('Member deleted successfully.')
      setDeleteTarget(null)
      await loadMembers()
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to delete member'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Members</p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Manage your library members efficiently.</h1>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition">
            <FiPlus size={16} /> Register Member
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MemoizedAnimatedStatCard icon={<FiUsers size={18} />} title="Total Members" value={stats.totalMembers} description="Members registered in your library" />
        <MemoizedAnimatedStatCard icon={<FiBookOpen size={18} />} title="Active Members" value={stats.activeMembers} description="Members currently active" />
        <MemoizedAnimatedStatCard icon={<FiClock size={18} />} title="Members with Borrowed Books" value={stats.membersWithBorrowedBooks} description="Currently borrowing books" />
        <MemoizedAnimatedStatCard icon={<FiAlertCircle size={18} />} title="Members with Overdue Books" value={stats.membersWithOverdueBooks} description="Members past due date" />
      </div>

      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
        <label className="flex items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 shadow-sm">
          <FiSearch className="text-[var(--color-primary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, membership ID, email or phone" className="w-full border-0 bg-transparent text-sm outline-none" />
        </label>
      </div>

      {error ? <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
              <div className="h-36 rounded-[18px] bg-[var(--color-background)]" />
              <div className="mt-4 h-4 w-24 rounded-full bg-[var(--color-background)]" />
              <div className="mt-3 h-4 w-32 rounded-full bg-[var(--color-background)]" />
              <div className="mt-3 h-4 w-full rounded-full bg-[var(--color-background)]" />
            </div>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-sm">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/70 px-6 py-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <FiUsers size={24} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[var(--color-text)]">No members registered yet.</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-2)]">Register your first library member to begin issuing books.</p>
            <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition">
              <FiPlus size={16} /> Register First Member
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <div key={member._id} className="group w-full rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition duration-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary)]">
                    {getInitials(member.fullName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{member.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-2)]">{member.membershipId || '—'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {String(member.status || 'active').toLowerCase() === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[var(--color-text-2)]">
                {member.email ? (
                  <div className="flex items-center gap-2">
                    <FiMail size={14} className="text-[var(--color-primary)]" />
                    <span className="truncate">{member.email}</span>
                  </div>
                ) : null}
                {member.phone ? (
                  <div className="flex items-center gap-2">
                    <FiPhone size={14} className="text-[var(--color-primary)]" />
                    <span className="truncate">{member.phone}</span>
                  </div>
                ) : null}
                {member.address ? (
                  <div className="flex items-start gap-2">
                    <FiMapPin size={14} className="mt-0.5 text-[var(--color-primary)]" />
                    <span className="line-clamp-2">{member.address}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 text-sm text-[var(--color-text-2)]">
                <p className="text-xs uppercase tracking-[0.24em]">📅 Member Since</p>
                <p className="mt-1 font-semibold text-[var(--color-text)]">{formatDate(member.createdAt)}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-2)]">Currently Borrowed Books</p>
                <div className="mt-2">
                  {Array.isArray(member.currentBorrowedBooks) && member.currentBorrowedBooks.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {member.currentBorrowedBooks.map((title, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                          <span className="text-[var(--color-primary)]">📖</span>
                          <span className="truncate">{title}</span>
                        </li>
                      ))}
                      {member.currentBorrowedMore > 0 && (
                        <li className="text-sm text-[var(--color-text-2)]">+{member.currentBorrowedMore} more</li>
                      )}
                    </ul>
                  ) : (
                    <div className="mt-2 text-sm text-[var(--color-text-2)]">📚 No books currently borrowed.</div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 bg-[var(--color-background)]/30 rounded-[12px] px-3 py-2">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-[var(--color-text-2)]">📚 Current</p>
                    <p className="mt-1 font-semibold text-[var(--color-text)]">{Number(member.currentBorrowedCount || 0)}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-[var(--color-text-2)]">📖 Total</p>
                    <p className="mt-1 font-semibold text-[var(--color-text)]">{Number(member.totalBorrowedCount || 0)}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-[var(--color-text-2)]">⏰ Overdue</p>
                    <p className="mt-1 font-semibold text-[var(--color-text)]">{Number(member.overdueCount || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => { setSelectedMember(member); setForm({ fullName: member.fullName || '', email: member.email || '', phone: member.phone || '', address: member.address || '' }); setFormErrors({}); setIsModalOpen(true) }} className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)] h-10">
                  <span className="inline-flex items-center justify-center gap-2 w-full"><FiEdit2 size={14} /> Edit</span>
                </button>
                <button type="button" onClick={() => setDeleteTarget(member)} className="flex-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100 h-10">
                  <span className="inline-flex items-center justify-center gap-2 w-full"><FiTrash2 size={14} /> Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={resetForm} title={selectedMember ? 'Update Member' : 'Register Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput label="Full Name *" name="fullName" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Enter full name" error={formErrors.fullName} />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter email" />
          <TextInput label="Phone" name="phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Enter phone number" />
          <TextArea label="Address" name="address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Enter address" />
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={resetForm} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">Cancel</button>
            <PrimaryButton loading={saving} type="submit">{selectedMember ? 'Update Member' : 'Register Member'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Member?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.fullName}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={saving}
      />
    </motion.div>
  )
}
