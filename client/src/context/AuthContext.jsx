import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../services/api'
import toast from 'react-hot-toast'

// AuthContext provides user, token, loading state and auth functions
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('librosphere_token') || null)
  const [loading, setLoading] = useState(false)

  // Set axios default auth header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('librosphere_token', token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('librosphere_token')
    }
  }, [token])

  // Load current user if token exists
  useEffect(() => {
    let mounted = true
    async function loadUser() {
      if (!token) return
      setLoading(true)
      try {
        const res = await api.get('/auth/me')
        if (mounted) setUser(res.data.user || res.data)
      } catch (err) {
        // Token might be invalid; clear it
        setToken(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadUser()
    return () => { mounted = false }
  }, [token])

  const register = async (payload) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', payload)
      const jwt = res.data.token || res.data.jwt || res.data.accessToken
      if (jwt) setToken(jwt)
      setUser(res.data.user || null)
      toast.success('Registration successful')
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Registration failed'
      toast.error(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const login = async (payload) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', payload)
      const jwt = res.data.token || res.data.jwt || res.data.accessToken
      if (jwt) setToken(jwt)
      setUser(res.data.user || null)
      toast.success('Login successful')
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Login failed'
      toast.error(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, isAuthenticated, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
