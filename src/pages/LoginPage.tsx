import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

type LocationState = {
  from?: { pathname: string }
}

export function LoginPage() {
  const { signIn, signInWithGoogle, error: authError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    setMessage(null)
    setBusy(true)

    try {
      await signIn(email, password)
      navigate(state?.from?.pathname || '/customers', { replace: true })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleLogin() {
    clearError()
    setMessage(null)
    setBusy(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Google sign-in failed.')
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col justify-between bg-emerald-950 p-8 text-white sm:p-10">
          <div>
            <div className="mb-10 grid h-12 w-12 place-items-center rounded-md bg-white text-base font-bold text-emerald-950">
              HI
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Hope, Inc.
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              Customer operations, sales history, and access rights in one workspace.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-emerald-50">
              Manage customers with soft-removal rules, review read-only sales data, and keep
              account activation under administrator control.
            </p>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-emerald-50 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-md border border-white/15 bg-white/10 p-3">
              <p className="font-semibold text-white">82 customers</p>
              <p className="mt-1 text-emerald-100">Seed-ready customer records</p>
            </div>
            <div className="rounded-md border border-white/15 bg-white/10 p-3">
              <p className="font-semibold text-white">View-only sales</p>
              <p className="mt-1 text-emerald-100">No mutation controls for transaction tables</p>
            </div>
            <div className="rounded-md border border-white/15 bg-white/10 p-3">
              <p className="font-semibold text-white">RLS guarded</p>
              <p className="mt-1 text-emerald-100">Inactive accounts blocked on login</p>
            </div>
          </div>
        </div>

        <div className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Secure access
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Sign in</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your activated account to enter the CMS.
              </p>
            </div>

        {!isSupabaseConfigured ? (
          <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Demo mode is active. Enter any email and password to open the Sprint 1 CMS shell.
          </p>
        ) : null}

        {(message || authError) && (
          <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {message || authError}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn aria-hidden="true" size={18} />
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogleLogin()}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound aria-hidden="true" size={18} />
          Sign in with Google
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Need an account?{' '}
          <Link className="font-medium text-emerald-700" to="/register">
            Register
          </Link>
        </p>
          </div>
        </div>
      </section>
    </main>
  )
}
