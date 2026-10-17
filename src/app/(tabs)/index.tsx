import { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { api } from '../../api/client'
import type { LessonSummary } from '../../api/types'
import { Centered, ErrorText, Loading } from '../../components/ui'
import { colors, kindEmoji, kindLabel } from '../../theme'

export default function Home() {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLessons(await api.lessons())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load lessons')
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  if (!lessons && !error) return <Loading />
  if (!lessons)
    return (
      <Centered>
        <ErrorText message={error} />
      </Centered>
    )

  return (
    <FlatList
      data={lessons}
      keyExtractor={(l) => String(l.id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true)
            await load()
            setRefreshing(false)
          }}
        />
      }
      ListEmptyComponent={<Text style={styles.empty}>New lessons are on the way. Check back soon!</Text>}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/lesson/${item.id}`)}
          style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <View style={[styles.badge, { backgroundColor: colors.kind[item.kind] }]}>
            <Text style={styles.badgeEmoji}>{kindEmoji[item.kind]}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {kindLabel[item.kind]}
              {item.bible_passage ? ` · ${item.bible_passage}` : ''}
              {item.has_quiz ? ' · Quiz ⭐' : ''}
            </Text>
          </View>
        </Pressable>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 16, marginTop: 48 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badgeEmoji: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { fontSize: 14, color: colors.muted },
})
