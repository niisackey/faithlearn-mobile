import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../../api/client'
import type { AttemptResult, Quiz } from '../../api/types'
import { Button, Centered, ErrorText, Loading } from '../../components/ui'
import { useSession } from '../../state/session'
import { colors } from '../../theme'

/** Quiz for a lesson; the route param is the lesson id. */
export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useSession()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .lessonQuiz(Number(id))
      .then(setQuiz)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load quiz'))
  }, [id])

  if (error && !quiz)
    return (
      <Centered>
        <ErrorText message={error} />
      </Centered>
    )
  if (!quiz) return <Loading />

  if (result) {
    const perfect = result.score === result.max_score
    const choiceText = (qid: number, cid: number | null) =>
      quiz.questions.find((q) => q.id === qid)?.choices.find((c) => c.id === cid)?.text ?? '—'
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.bigEmoji}>{perfect ? '🎉' : result.score > 0 ? '👏' : '💪'}</Text>
        <Text style={styles.score}>
          {result.score} / {result.max_score}
        </Text>
        <Text style={styles.cheer}>{perfect ? 'Perfect score!' : 'Great effort! Keep learning.'}</Text>
        {result.results.map((r, i) => (
          <View key={r.question_id} style={[styles.review, { borderColor: r.correct ? colors.success : colors.danger }]}>
            <Text style={styles.reviewQ}>
              {r.correct ? '✅' : '❌'} {i + 1}. {quiz.questions.find((q) => q.id === r.question_id)?.prompt}
            </Text>
            {!r.correct && (
              <Text style={styles.reviewA}>Answer: {choiceText(r.question_id, r.correct_choice_id)}</Text>
            )}
          </View>
        ))}
        {!user && (
          <Text style={styles.hint}>Create an account to put your stars on the leaderboard.</Text>
        )}
        <Button title="Back to lessons" onPress={() => router.navigate('/(tabs)')} />
      </ScrollView>
    )
  }

  const question = quiz.questions[index]
  const last = index === quiz.questions.length - 1
  const picked = answers[question.id]

  const next = async () => {
    if (!last) return setIndex(index + 1)
    setBusy(true)
    setError(null)
    try {
      const payload = Object.entries(answers).map(([qid, cid]) => ({ question_id: Number(qid), choice_id: cid }))
      setResult(await api.submitAttempt(quiz.id, payload))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((index + 1) / quiz.questions.length) * 100}%` }]} />
      </View>
      <Text style={styles.counter}>
        Question {index + 1} of {quiz.questions.length}
      </Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.choices.map((c) => (
        <Pressable
          key={c.id}
          accessibilityRole="button"
          accessibilityState={{ selected: picked === c.id }}
          onPress={() => setAnswers({ ...answers, [question.id]: c.id })}
          style={[styles.choice, picked === c.id && styles.choicePicked]}
        >
          <Text style={[styles.choiceText, picked === c.id && { color: colors.primaryText }]}>{c.text}</Text>
        </Pressable>
      ))}
      <ErrorText message={error} />
      <Button title={last ? (busy ? 'Checking…' : 'Finish') : 'Next'} onPress={next} disabled={picked === undefined || busy} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 48 },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  counter: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  prompt: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  choice: { padding: 18, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  choicePicked: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { fontSize: 18, fontWeight: '600', color: colors.text },
  bigEmoji: { fontSize: 72, textAlign: 'center', marginTop: 16 },
  score: { fontSize: 44, fontWeight: '800', textAlign: 'center', color: colors.text },
  cheer: { fontSize: 18, textAlign: 'center', color: colors.muted, marginBottom: 8 },
  review: { borderWidth: 2, borderRadius: 14, padding: 14, gap: 4, backgroundColor: colors.surface },
  reviewQ: { fontSize: 16, fontWeight: '600', color: colors.text },
  reviewA: { fontSize: 15, color: colors.muted },
  hint: { fontSize: 15, color: colors.muted, textAlign: 'center' },
})
