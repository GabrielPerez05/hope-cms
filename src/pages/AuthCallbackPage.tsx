import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthCallbackPage() {
  const { currentUser, loading, error } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (currentUser) {
      navigate('/customers', { replace: true })
      return
    }

    if (error) {
      navigate('/login', { replace: true })
    }
  }, [currentUser, error, loading, navigate])

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />
        <h1 className="text-lg font-semibold text-slate-950">Finishing sign-in</h1>
        <p className="mt-1 text-sm text-slate-600">Your account status is being checked.</p>
      </section>
    </main>
  )
}
