import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AuthContext } from '../../context/AuthContext'
import { fetchProfile, updateProfile } from '../../services/profileService'
import PrimaryButton from '../../components/auth/PrimaryButton'
import InputField from '../../components/auth/InputField'
import PasswordField from '../../components/auth/PasswordField'

function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatDate(value) {
  if (!value) return 'Not Available'
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return 'Not Available'
  }
}

export default function Profile() {
  const { user: authUser, setUser } = useContext(AuthContext)
  const [user, setLocalUser] = useState(authUser)
  const [loading, setLoading] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const fileInputRef = useRef(null)

  const loadProfile = async () => {
    if (!authUser) {
      setLoading(true)
      try {
        const profile = await fetchProfile()
        setLocalUser(profile)
      } catch (err) {
        console.error(err)
        toast.error('Unable to load profile')
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!authUser) {
      loadProfile()
      return
    }
    setLocalUser(authUser)
  }, [authUser])

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' })
    }
  }, [user])

  const profileCard = useMemo(() => ({
    avatar: user?.avatar || '',
    initials: getInitials(user?.name || ''),
    name: user?.name || 'User',
    email: user?.email || 'Not Available',
    role: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator',
    memberSince: formatDate(user?.createdAt),
  }), [user])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    setPasswordErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSavePersonal = async (event) => {
    event.preventDefault()
    if (!user) return
    const name = form.name.trim()
    if (!name) {
      setErrors({ name: 'Full name is required' })
      return
    }
    if (name === user.name) {
      toast('No changes to save')
      return
    }
    setSavingInfo(true)
    try {
      const updated = await updateProfile({ name })
      setLocalUser(updated)
      setUser(updated)
      toast.success('Profile updated successfully')
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update profile'
      toast.error(message)
    } finally {
      setSavingInfo(false)
    }
  }

  const handleReset = () => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' })
      setErrors({})
      setPasswordErrors({})
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
  }

  const handleUpdatePassword = async (event) => {
    event.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordForm
    const nextErrors = {}
    if (!currentPassword) nextErrors.currentPassword = 'Current password is required'
    if (!newPassword) nextErrors.newPassword = 'New password is required'
    if (newPassword && newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters'
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords must match'
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      return
    }
    setSavingPassword(true)
    try {
      const updated = await updateProfile({ currentPassword, password: newPassword })
      setLocalUser(updated)
      setUser(updated)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully')
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update password'
      toast.error(message)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarButton = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    setAvatarLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const avatar = reader.result
      try {
        const updated = await updateProfile({ avatar })
        setLocalUser(updated)
        setUser(updated)
        toast.success('Avatar updated successfully')
      } catch (err) {
        console.error(err)
        const message = err?.response?.data?.message || 'Unable to update avatar'
        toast.error(message)
      } finally {
        setAvatarLoading(false)
      }
    }
    reader.onerror = () => {
      toast.error('Unable to read file')
      setAvatarLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const accountInfo = useMemo(() => ({
    role: profileCard.role,
    status: 'Active',
    memberSince: profileCard.memberSince,
    registrationDate: profileCard.memberSince,
    lastLogin: user?.lastLogin ? formatDate(user.lastLogin) : 'Not Available',
  }), [profileCard.role, profileCard.memberSince, user?.lastLogin])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Profile</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Manage your account information.</h1>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              {profileCard.avatar ? (
                <img src={profileCard.avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-3xl font-semibold text-white">
                  {profileCard.initials}
                </div>
              )}
              <button
                type="button"
                onClick={handleAvatarButton}
                className="absolute bottom-0 right-0 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm text-[var(--color-text)] shadow-sm hover:bg-[var(--color-border)]"
              >
                📷
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelected} />
            </div>
            <div>
              <p className="text-xl font-semibold text-[var(--color-text)]">{profileCard.name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-2)]">{profileCard.email}</p>
            </div>
            <div className="grid gap-2 text-sm text-[var(--color-text-2)]">
              <div className="rounded-2xl bg-[var(--color-background)] p-3">
                <p className="text-[var(--color-text)] font-semibold">Role</p>
                <p>{profileCard.role}</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-background)] p-3">
                <p className="text-[var(--color-text)] font-semibold">Member Since</p>
                <p>{profileCard.memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 grid gap-4">
          <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Personal Information</h2>
                <p className="mt-2 text-sm text-[var(--color-text-2)]">Update your name and keep your account details current.</p>
              </div>
            </div>
            <form onSubmit={handleSavePersonal} className="mt-6 space-y-5">
              <InputField label="Full Name" name="name" value={form.name} onChange={handleInputChange} placeholder="Your full name" error={errors.name} />
              <InputField label="Email" name="email" type="email" value={form.email} onChange={handleInputChange} placeholder="Your email" error={errors.email} />
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={handleReset} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border)]">
                  Reset
                </button>
                <PrimaryButton loading={savingInfo} type="submit">Save Changes</PrimaryButton>
              </div>
            </form>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Change Password</h2>
                <p className="mt-2 text-sm text-[var(--color-text-2)]">Secure your account with a new strong password.</p>
              </div>
            </div>
            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
              <PasswordField label="Current Password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" error={passwordErrors.currentPassword} />
              <PasswordField label="New Password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" error={passwordErrors.newPassword} />
              <PasswordField label="Confirm New Password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" error={passwordErrors.confirmPassword} />
              <div className="flex justify-end">
                <PrimaryButton loading={savingPassword} type="submit">Update Password</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Account Information</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-[var(--color-background)] p-5">
              <p className="text-sm text-[var(--color-text-2)]">Role</p>
              <p className="mt-2 font-semibold text-[var(--color-text)]">{accountInfo.role}</p>
            </div>
            <div className="rounded-3xl bg-[var(--color-background)] p-5">
              <p className="text-sm text-[var(--color-text-2)]">Account Status</p>
              <p className="mt-2 font-semibold text-[var(--color-text)]">{accountInfo.status}</p>
            </div>
            <div className="rounded-3xl bg-[var(--color-background)] p-5">
              <p className="text-sm text-[var(--color-text-2)]">Member Since</p>
              <p className="mt-2 font-semibold text-[var(--color-text)]">{accountInfo.memberSince}</p>
            </div>
            <div className="rounded-3xl bg-[var(--color-background)] p-5">
              <p className="text-sm text-[var(--color-text-2)]">Last Login</p>
              <p className="mt-2 font-semibold text-[var(--color-text)]">{accountInfo.lastLogin}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Security Tips</h2>
          <ul className="mt-5 space-y-3 text-sm text-[var(--color-text-2)]">
            <li className="rounded-3xl bg-[var(--color-background)] p-4">Use a strong password with letters, numbers, and symbols.</li>
            <li className="rounded-3xl bg-[var(--color-background)] p-4">Keep your credentials secure and never share your password.</li>
            <li className="rounded-3xl bg-[var(--color-background)] p-4">Update your password regularly to protect your account.</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
