import React, { useEffect, useMemo, useState } from 'react'
import Navbar from './Components/Navbar.jsx'
import './App.css'
import Manager from './Components/Manager.jsx'
import Footer from './Components/Fotter.jsx'

function App() {
  const rawServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
  const serverUrl = useMemo(() => rawServerUrl.replace(/\/$/, ''), [rawServerUrl])

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [token, setToken] = useState(localStorage.getItem('passop_token') || '')
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('passop_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [authError, setAuthError] = useState('')
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return

      try {
        const res = await fetch(`${serverUrl}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          throw new Error('Session expired')
        }

        const data = await res.json()
        if (data?.user) {
          setUser(data.user)
          localStorage.setItem('passop_user', JSON.stringify(data.user))
        }
      } catch (error) {
        localStorage.removeItem('passop_token')
        localStorage.removeItem('passop_user')
        setToken('')
        setUser(null)
      }
    }

    verifyToken()
  }, [token, serverUrl])

  const handleAuthChange = (event) => {
    const { name, value } = event.target
    setAuthForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem('passop_token')
    localStorage.removeItem('passop_user')
    setToken('')
    setUser(null)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthError('')
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    const payload = {
      email: authForm.email.trim(),
      password: authForm.password.trim()
    }

    if (!isLoginMode) {
      payload.name = authForm.name.trim()
    }

    if (!payload.email || !payload.password || (!isLoginMode && !payload.name)) {
      setAuthError('Please fill all required fields.')
      return
    }

    try {
      setIsSubmittingAuth(true)
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register'
      const res = await fetch(`${serverUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok || !data?.token) {
        throw new Error(data?.error || 'Authentication failed')
      }

      localStorage.setItem('passop_token', data.token)
      localStorage.setItem('passop_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setAuthForm({ name: '', email: '', password: '' })
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfccb_0%,#f7fee7_35%,#ecfeff_100%)] text-slate-900">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6">
        {!token || !user ? (
          <section className="mx-auto mt-10 w-full max-w-md rounded-3xl border border-lime-200 bg-white/90 p-7 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isLoginMode
                ? 'Sign in to view only your private passwords.'
                : 'Register to create your private password vault.'}
            </p>

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {!isLoginMode && (
                <input
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthChange}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-lime-200 bg-lime-50/50 px-4 py-3 outline-none transition focus:border-lime-500"
                />
              )}

              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="Email"
                className="w-full rounded-xl border border-lime-200 bg-lime-50/50 px-4 py-3 outline-none transition focus:border-lime-500"
              />

              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="Password"
                className="w-full rounded-xl border border-lime-200 bg-lime-50/50 px-4 py-3 outline-none transition focus:border-lime-500"
              />

              {authError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full rounded-xl bg-lime-600 px-4 py-3 font-semibold text-white transition hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingAuth ? 'Please wait...' : isLoginMode ? 'Login' : 'Register'}
              </button>
            </form>

            <button
              onClick={() => {
                setAuthError('')
                setIsLoginMode((prev) => !prev)
              }}
              className="mt-4 w-full text-sm font-medium text-lime-700 underline decoration-lime-400 underline-offset-4"
            >
              {isLoginMode ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </section>
        ) : (
          <Manager token={token} user={user} onLogout={handleLogout} />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
