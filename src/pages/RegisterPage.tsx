import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setBusy(true)

    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        username,
      })
      setMessage('Registration submitted. Check your email, then wait for account activation.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleRegister() {
    setMessage(null)
    setBusy(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Google registration failed.')
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col justify-between bg-slate-950 p-8 text-white sm:p-10">
          <div>
            <div className="mb-10 grid h-12 w-12 place-items-center rounded-md bg-emerald-500 text-base font-bold text-slate-950">
              HI
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Account request
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              New accounts start inactive until approved.
            </h1>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Email/password and Google sign-ins use the same provisioning flow, assigning USER
              rights and blocking access until activation.
            </p>
          </div>
          <div className="mt-10 rounded-md border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
            Default access includes customer viewing plus read-only sales, detail, product, and
            price history rights.
          </div>
        </div>

        <div className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Hope, Inc.
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Register</h2>
              <p className="mt-2 text-sm text-slate-600">
                Submit your details for administrator activation.
              </p>
            </div>

        {message && (
          <p className="mb-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
            {message}
          </p>
        )}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleRegister}>
          <label className="block text-sm font-medium text-slate-700">
            First Name
            <input
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Last Name
            <input
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Username
            <input
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            <UserPlus aria-hidden="true" size={18} />
            {busy ? 'Submitting...' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogleRegister()}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound aria-hidden="true" size={18} />
          Register with Google
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already active?{' '}
          <Link className="font-medium text-emerald-700" to="/login">
            Sign in
          </Link>
        </p>
          </div>
        </div>
      </section>
    </main>
  )
}
