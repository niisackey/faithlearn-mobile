import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setCredentials } from '../api/client'
import type { User } from '../api/types'
import { storage } from './storage'

const GUEST_KEY = 'faithlearn.guestId'
const TOKEN_KEY = 'faithlearn.token'

interface Session {
  ready: boolean
  guestId: string | null
  token: string | null
  user: User | null
  /** True once the learner has a guest profile or an account. */
  hasIdentity: boolean
  startAsGuest: (age: number, name?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (input: { email: string; password: string; displayName: string; age?: number }) => Promise<void>
  logout: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setCredentials({ token, guestId })
  }, [token, guestId])

  useEffect(() => {
    ;(async () => {
      const [g, t] = await Promise.all([storage.get(GUEST_KEY), storage.get(TOKEN_KEY)])
      setCredentials({ token: t, guestId: g })
      setGuestId(g)
      if (t) {
        try {
          setUser(await api.me())
          setToken(t)
        } catch {
          await storage.remove(TOKEN_KEY)
          setCredentials({ token: null, guestId: g })
        }
      }
      setReady(true)
    })()
  }, [])

  const saveToken = useCallback(async (accessToken: string, u: User) => {
    await storage.set(TOKEN_KEY, accessToken)
    setCredentials({ token: accessToken, guestId })
    setToken(accessToken)
    setUser(u)
  }, [guestId])

  const startAsGuest = useCallback(async (age: number, name?: string) => {
    const guest = await api.createGuest(age, name)
    await storage.set(GUEST_KEY, guest.id)
    setCredentials({ token: null, guestId: guest.id })
    setGuestId(guest.id)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password)
      await saveToken(res.access_token, res.user)
    },
    [saveToken],
  )

  const register = useCallback(
    async ({ email, password, displayName, age }: { email: string; password: string; displayName: string; age?: number }) => {
      const res = await api.register({
        email,
        password,
        display_name: displayName,
        // A guest's progress and age group move to the new account.
        ...(guestId ? { guest_id: guestId } : { age }),
      })
      if (guestId) {
        await storage.remove(GUEST_KEY)
        setGuestId(null)
      }
      await saveToken(res.access_token, res.user)
    },
    [guestId, saveToken],
  )

  const logout = useCallback(async () => {
    await storage.remove(TOKEN_KEY)
    setCredentials({ token: null, guestId })
    setToken(null)
    setUser(null)
  }, [guestId])

  const value = useMemo<Session>(
    () => ({
      ready,
      guestId,
      token,
      user,
      hasIdentity: Boolean(user || guestId),
      startAsGuest,
      login,
      register,
      logout,
    }),
    [ready, guestId, token, user, startAsGuest, login, register, logout],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
