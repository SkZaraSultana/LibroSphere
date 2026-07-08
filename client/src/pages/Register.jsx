import React, { useState, useContext } from 'react'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/auth/InputField'
import PasswordField from '../components/auth/PasswordField'
import PrimaryButton from '../components/auth/PrimaryButton'
import { AuthContext } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const { register, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validate = () => {
    const err = {}
    if (!form.name) err.name = 'Full name is required'
    if (!form.email) err.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = 'Enter a valid email'
    if (!form.password) err.password = 'Password is required'
    else if (form.password.length < 6) err.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) err.confirm = 'Passwords do not match'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const res = await register({ name: form.name, email: form.email, password: form.password })
    if (res.ok) navigate('/dashboard')
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>Create your account</h1>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">Register your team and start managing library operations in minutes.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" error={errors.name} />
        <InputField label="Email address" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" error={errors.email} />
        <PasswordField label="Password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" error={errors.password} />
        <PasswordField label="Confirm Password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Confirm password" error={errors.confirm} />

        <PrimaryButton loading={loading} type="submit">Create Account</PrimaryButton>

        <p className="mt-2 text-center text-sm text-[var(--color-text-2)]">Already have an account? <Link to="/login" className="text-[var(--color-primary)]">Login</Link></p>
      </form>
    </AuthLayout>
  )
}
