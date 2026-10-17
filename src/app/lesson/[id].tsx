import { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../../api/client'
import type { Lesson } from '../../api/types'
import { LessonMedia } from '../../components/LessonMedia'
import { Button, Centered, ErrorText, Loading } from '../../components/ui'
import { colors, kindEmoji, kindLabel } from '../../theme'

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .lesson(Number(id))
      .then(setLesson)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load lesson'))
  }, [id])

  if (error)
    return (
      <Centered>
        <ErrorText message={error} />
      </Centered>
    )
  if (!lesson) return <Loading />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: kindLabel[lesson.kind] }} />
      <Text style={[styles.kind, { color: colors.kind[lesson.kind] }]}>
        {kindEmoji[lesson.kind]} {kindLabel[lesson.kind]}
      </Text>
      <Text style={styles.title}>{lesson.title}</Text>
      {lesson.bible_passage && <Text style={styles.passage}>{lesson.bible_passage}</Text>}

      {lesson.media_url && <LessonMedia url={lesson.media_url} />}

      {lesson.body && <Text style={styles.body}>{lesson.body}</Text>}

      {lesson.memory_verse && (
        <View style={styles.verse}>
          <Text style={styles.verseLabel}>Memory verse</Text>
          <Text style={styles.verseText}>{lesson.memory_verse}</Text>
        </View>
      )}

      {lesson.has_quiz && <Button title="Take the quiz ⭐" onPress={() => router.push(`/quiz/${lesson.id}`)} />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 48 },
  kind: { fontSize: 15, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  passage: { fontSize: 16, color: colors.muted, marginTop: -8 },
  body: { fontSize: 19, lineHeight: 30, color: colors.text },
  verse: { backgroundColor: '#FFF3BF', borderRadius: 16, padding: 18, gap: 6 },
  verseLabel: { fontSize: 13, fontWeight: '800', color: '#946200', textTransform: 'uppercase' },
  verseText: { fontSize: 19, lineHeight: 28, fontStyle: 'italic', color: colors.text },
})
