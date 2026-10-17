import Constants from 'expo-constants'
import type {
  AttemptResult,
  Classroom,
  Guest,
  LeaderboardEntry,
  Lesson,
  LessonSummary,
  Quiz,
  User,
} from './types'

/**
 * API base URL: EXPO_PUBLIC_API_URL if set, otherwise the dev machine running Metro on port 8000,
 * so a phone on the same Wi-Fi reaches the local backend without config.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const hostUri = Constants.expoConfig?.hostUri // e.g. "192.168.1.20:8081"
  const host = hostUri?.split(':')[0]
  return host ? `http://${host}:8000` : 'http://localhost:8000'
}

export const API_URL = resolveApiUrl()

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export interface Credentials {
  token: string | null
  guestId: string | null
}

let credentials: Credentials = { token: null, guestId: null }

export function setCredentials(next: Credentials) {
  credentials = next
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.body) headers['Content-Type'] = 'application/json'
  if (credentials.token) headers.Authorization = `Bearer ${credentials.token}`
  else if (credentials.guestId) headers['X-Guest-Id'] = credentials.guestId

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...(init.headers as object) } })
  } catch {
    throw new ApiError(0, "Can't reach faithlearn. Check your internet connection.")
  }
  if (!res.ok) {
    let message = 'Something went wrong'
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') message = data.detail
      else if (Array.isArray(data.detail)) message = data.detail[0]?.msg ?? message
    } catch {
      // keep default message
    }
    throw new ApiError(res.status, message)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) })

export const api = {
  createGuest: (age: number, name?: string) => request<Guest>('/guests', post({ age, name: name || null })),
  register: (body: { email: string; password: string; display_name: string; age?: number; guest_id?: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', post(body)),
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>('/auth/login', post({ email, password })),
  me: () => request<User>('/me'),

  lessons: () => request<LessonSummary[]>('/lessons'),
  lesson: (id: number) => request<Lesson>(`/lessons/${id}`),
  lessonQuiz: (lessonId: number) => request<Quiz>(`/lessons/${lessonId}/quiz`),
  submitAttempt: (quizId: number, answers: { question_id: number; choice_id: number }[]) =>
    request<AttemptResult>(`/quizzes/${quizId}/attempts`, post({ answers })),

  globalLeaderboard: () => request<LeaderboardEntry[]>('/leaderboard/global'),
  classLeaderboard: (classroomId: number) => request<LeaderboardEntry[]>(`/leaderboard/class/${classroomId}`),
  myClassrooms: () => request<Classroom[]>('/classrooms/mine'),
  joinClassroom: (joinCode: string) => request<Classroom>('/classrooms/join', post({ join_code: joinCode })),
}
