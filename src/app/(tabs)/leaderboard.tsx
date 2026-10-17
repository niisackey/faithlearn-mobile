import { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { api } from '../../api/client'
import type { Classroom, LeaderboardEntry } from '../../api/types'
import { Button, Centered, ErrorText, Loading } from '../../components/ui'
import { useSession } from '../../state/session'
import { colors } from '../../theme'

const medal = (rank: number) => (['🥇', '🥈', '🥉'][rank - 1] ?? `${rank}`)

export default function Leaderboard() {
  const { user } = useSession()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [scope, setScope] = useState<number | 'global'>('global')
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      let cancelled = false
      ;(async () => {
        try {
          const [rooms, board] = await Promise.all([
            api.myClassrooms(),
            scope === 'global' ? api.globalLeaderboard() : api.classLeaderboard(scope),
          ])
          if (cancelled) return
          setClasses(rooms)
          setEntries(board)
          setError(null)
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load leaderboard')
        }
      })()
      return () => {
        cancelled = true
      }
    }, [user, scope]),
  )

  if (!user) {
    return (
      <Centered>
        <Text style={styles.lockEmoji}>🏆</Text>
        <Text style={styles.lockTitle}>Join the leaderboard</Text>
        <Text style={styles.lockText}>Create a free account to save your progress and see how you rank.</Text>
        <Button title="Create account" onPress={() => router.push('/auth/register')} style={{ alignSelf: 'stretch' }} />
      </Centered>
    )
  }

  const tabs: { key: number | 'global'; label: string }[] = [
    { key: 'global', label: 'Everyone' },
    ...classes.map((c) => ({ key: c.id, label: c.name })),
  ]

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <Pressable
            key={String(t.key)}
            onPress={() => {
              setEntries(null)
              setScope(t.key)
            }}
            style={[styles.tab, scope === t.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, scope === t.key && { color: colors.primaryText }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <ErrorText message={error} />
      {!entries ? (
        <Loading />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => String(e.user_id)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={<Text style={styles.empty}>No scores yet. Finish a quiz to get on the board!</Text>}
          renderItem={({ item }) => (
            <View style={[styles.row, item.user_id === user.id && styles.rowMe]}>
              <Text style={styles.rank}>{medal(item.rank)}</Text>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.score}>{item.total_score} ⭐</Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  lockEmoji: { fontSize: 56 },
  lockTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginVertical: 8 },
  lockText: { fontSize: 16, color: colors.muted, textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 0 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontWeight: '600', color: colors.text },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 16, marginTop: 48 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMe: { borderColor: colors.primary, borderWidth: 2 },
  rank: { width: 36, fontSize: 20, textAlign: 'center', fontWeight: '700', color: colors.text },
  name: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  score: { fontSize: 17, fontWeight: '700', color: colors.text },
})
