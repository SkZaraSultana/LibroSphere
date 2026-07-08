import React, { useContext, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AuthContext } from '../../context/AuthContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import { fetchLibrarySettings, updateLibrarySettings } from '../../services/librarySettingsService'
import { deleteAccount } from '../../services/userService'

function formatDate(value) {
  if (!value) return 'Not Available'
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return 'Not Available'
  }
}



export default function Settings() {
  const { user: authUser, logout } = useContext(AuthContext)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [libSettings, setLibSettings] = useState({
    defaultBorrowDays: 14,
    finePerDay: 5,
    maxBooksPerMember: 5,
    autoFine: true,
  })
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    // load per-user library settings
    let mounted = true
    async function loadSettings() {
      setLoadingSettings(true)
      try {
        const s = await fetchLibrarySettings()
        if (!mounted) return
        if (s && Object.keys(s).length > 0) {
          setLibSettings({
            defaultBorrowDays: s.defaultBorrowDays ?? 14,
            finePerDay: s.finePerDay ?? 5,
            maxBooksPerMember: s.maxBooksPerMember ?? 5,
            autoFine: s.autoFine ?? true,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSettings(false)
      }
    }
    loadSettings()
  }, [])

  

  const resetDefaults = () => {
    setLibSettings({ defaultBorrowDays: 14, finePerDay: 5, maxBooksPerMember: 5, autoFine: true })
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await updateLibrarySettings(libSettings)
      toast.success('Library rules saved')
    } catch (err) {
      console.error(err)
      toast.error('Unable to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success('Your account has been deleted')
      logout()
    } catch (err) {
      console.error(err)
      const message = err?.response?.data?.message || 'Unable to delete account'
      toast.error(message)
    } finally {
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Settings</p>
              <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Configure your library preferences.</h1>
            </div>
            <div className="inline-flex flex-col gap-2 text-sm text-[var(--color-text-2)]">
              <span>Account settings are stored securely.</span>
              <span>Export library data for backup or migration.</span>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Account Information</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">Account Information</h2>
            <p className="mt-3 text-sm text-[var(--color-text-2)]">Read-only account details for this authenticated user.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <p className="text-sm text-[var(--color-text-2)]">Full Name</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{authUser?.name || 'Not Available'}</p>
              </div>
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <p className="text-sm text-[var(--color-text-2)]">Email Address</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{authUser?.email || 'Not Available'}</p>
              </div>
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <p className="text-sm text-[var(--color-text-2)]">Member Since</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{authUser?.createdAt ? formatDate(authUser.createdAt) : 'Not Available'}</p>
              </div>
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <p className="text-sm text-[var(--color-text-2)]">Account Status</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{authUser ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Library Rules</h2>
            <p className="mt-3 text-sm text-[var(--color-text-2)]">Set defaults for borrow durations, fines, and per-member limits.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <label className="text-sm text-[var(--color-text-2)]">Default Borrow Duration (Days)</label>
                <input type="number" min="1" value={libSettings.defaultBorrowDays} onChange={(e) => setLibSettings((p) => ({ ...p, defaultBorrowDays: Number(e.target.value) }))} className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--color-text)]" />
              </div>
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <label className="text-sm text-[var(--color-text-2)]">Fine Per Overdue Day (₹)</label>
                <input type="number" min="0" value={libSettings.finePerDay} onChange={(e) => setLibSettings((p) => ({ ...p, finePerDay: Number(e.target.value) }))} className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--color-text)]" />
                <p className="mt-2 text-xs text-[var(--color-text-2)]">Example: ₹5 means every overdue day adds ₹5.</p>
              </div>
              <div className="rounded-3xl bg-[var(--color-background)] p-5">
                <label className="text-sm text-[var(--color-text-2)]">Maximum Books Per Member</label>
                <input type="number" min="1" value={libSettings.maxBooksPerMember} onChange={(e) => setLibSettings((p) => ({ ...p, maxBooksPerMember: Number(e.target.value) }))} className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--color-text)]" />
              </div>
              <div className="rounded-3xl bg-[var(--color-background)] p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-2)]">Auto Calculate Fine</p>
                  <p className="mt-1 text-xs text-[var(--color-text-2)]">When ON, fines are computed automatically for overdue items.</p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={Boolean(libSettings.autoFine)} onChange={(e) => setLibSettings((p) => ({ ...p, autoFine: e.target.checked }))} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:bg-[var(--color-primary)]"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" onClick={resetDefaults} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)]">
                Reset Defaults
              </button>
              <button type="button" onClick={handleSaveSettings} disabled={savingSettings} className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white">
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-red-200 bg-[var(--color-card)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-red-600">Danger Zone</p>
              <h2 className="mt-3 text-lg font-semibold text-[var(--color-text)]">Delete your account</h2>
              <p className="mt-2 text-sm text-[var(--color-text-2)]">Deleting your account will remove your user profile, books, members, and loans permanently. This cannot be undone.</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center justify-center rounded-full border border-red-600 bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
      </motion.div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This will remove all your owned library data and cannot be undone."
        onConfirm={handleDeleteAccount}
        onClose={() => setConfirmingDelete(false)}
        loading={deleting}
      />
    </>
  )
}
