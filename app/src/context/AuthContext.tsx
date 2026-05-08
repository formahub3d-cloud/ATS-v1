import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/database.types'

export type Profile = {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

type AuthState = {
  status: 'loading' | 'authenticated' | 'anonymous'
  session: Session | null
  user: User | null
  profile: Profile | null
}

type SignUpInput = {
  email: string
  password: string
  fullName?: string
  role?: UserRole
}

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (input: SignUpInput) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    session: null,
    user: null,
    profile: null,
  })
  const profileFetchToken = useRef(0)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('[auth] fetchProfile error', error)
      return null
    }
    return data
  }, [])

  const applySession = useCallback(
    async (session: Session | null) => {
      const token = ++profileFetchToken.current
      if (!session?.user) {
        setState({ status: 'anonymous', session: null, user: null, profile: null })
        return
      }
      const profile = await fetchProfile(session.user.id)
      if (token !== profileFetchToken.current) return
      setState({
        status: 'authenticated',
        session,
        user: session.user,
        profile,
      })
    },
    [fetchProfile],
  )

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      void applySession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      void applySession(session)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [applySession])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }, [])

  const signUp = useCallback(async ({ email, password, fullName, role }: SignUpInput) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName ?? null,
          role: role ?? 'employee',
        },
      },
    })
    return { error: error ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.user) return
    const profile = await fetchProfile(state.user.id)
    setState((s) => ({ ...s, profile }))
  }, [fetchProfile, state.user])

  const value = useMemo<AuthContextType>(
    () => ({ ...state, signIn, signUp, signOut, refreshProfile }),
    [state, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
