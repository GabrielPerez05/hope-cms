import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export type AppUser = User & {
  username?: string | null
  user_type?: 'SUPERADMIN' | 'ADMIN' | 'USER'
  record_status?: 'ACTIVE' | 'INACTIVE'
}

export type AuthContextValue = {
  currentUser: AppUser | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

async function loadAppUser(session: Session): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('user')
    .select('record_status, user_type, username')
    .eq('userId', session.user.id)
    .single()

  if (error) {
    throw error
  }

  if (data?.record_status !== 'ACTIVE') {
    await supabase.auth.signOut()
    throw new Error('Your account is pending activation by a Sales Manager.')
  }

  return { ...session.user, ...data }
}

const demoUser = {
  id: 'demo-user',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@hope.local',
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
  username: 'Demo Admin',
  user_type: 'SUPERADMIN',
  record_status: 'ACTIVE',
} as AppUser

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const applySession = useCallback(async (nextSession: Session | null) => {
    setLoading(true)
    setError(null)

    try {
      setSession(nextSession)
      if (!nextSession) {
        setCurrentUser(null)
        return
      }

      const user = await loadAppUser(nextSession)
      setCurrentUser(user)
    } catch (err) {
      setCurrentUser(null)
      setSession(null)
      setError(err instanceof Error ? err.message : 'Unable to verify this account.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [applySession])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setCurrentUser({ ...demoUser, email, username: email.split('@')[0] })
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) throw signInError
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, metadata: Record<string, string>) => {
      if (!isSupabaseConfigured) {
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCurrentUser(demoUser)
      return
    }

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (googleError) throw googleError
  }, [])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setCurrentUser(null)
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      session,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      clearError: () => setError(null),
    }),
    [currentUser, error, loading, session, signIn, signInWithGoogle, signOut, signUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
