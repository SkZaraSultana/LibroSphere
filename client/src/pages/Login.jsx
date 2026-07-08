import React, { useState, useContext } from 'react'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/auth/InputField'
import PasswordField from '../components/auth/PasswordField'
import PrimaryButton from '../components/auth/PrimaryButton'
import { AuthContext } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const { login, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const validate = () => {
    const err = {}
    if (!form.email) err.email = 'Email is required'
    if (!form.password) err.password = 'Password is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const res = await login({ email: form.email, password: form.password })
    if (res.ok) navigate('/dashboard')
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>Welcome back</h1>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">Login to your LibroSphere account</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <InputField label="Email address" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" error={errors.email} />
        <PasswordField label="Password" name="password" value={form.password} onChange={handleChange} placeholder="Your password" error={errors.password} />

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-text-2)]">
            <input name="remember" type="checkbox" checked={form.remember} onChange={handleChange} className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-card)]" />
            Remember Me
          </label>
          <Link to="/forgot" className="text-sm text-[var(--color-primary)]">Forgot?</Link>
        </div>

        <PrimaryButton loading={loading} type="submit">Login</PrimaryButton>

        <p className="mt-2 text-center text-sm text-[var(--color-text-2)]">Don't have an account? <Link to="/register" className="text-[var(--color-primary)]">Register</Link></p>
      </form>
    </AuthLayout>
  )
}
