export type LessonKind = 'story' | 'video' | 'song'

export interface AgeGroup {
  id: number
  name: string
  min_age: number
  max_age: number
}

export interface Guest {
  id: string
  age_group: AgeGroup
}

export interface User {
  id: number
  email: string
  display_name: string
  role: 'learner' | 'teacher' | 'admin'
  age_group_id: number | null
}

export interface LessonSummary {
  id: number
  title: string
  kind: LessonKind
  bible_passage: string | null
  sequence: number
  age_group_id: number
  has_quiz: boolean
}

export interface Lesson extends LessonSummary {
  memory_verse: string | null
  body: string | null
  media_url: string | null
  source_url: string | null
}

export interface Quiz {
  id: number
  lesson_id: number
  questions: { id: number; prompt: string; choices: { id: number; text: string }[] }[]
}

export interface AttemptResult {
  attempt_id: number
  score: number
  max_score: number
  results: { question_id: number; chosen_choice_id: number | null; correct_choice_id: number; correct: boolean }[]
}

export interface LeaderboardEntry {
  rank: number
  user_id: number
  display_name: string
  total_score: number
}

export interface Classroom {
  id: number
  name: string
  join_code: string
}
