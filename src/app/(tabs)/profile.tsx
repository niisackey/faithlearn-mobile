import { useState } from 'react'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../../api/client'
import { Button, ErrorText, Field } from '../../components/ui'
import { useSession } from '../../state/session'
import { colors } from '../../theme'

export default function Profile() {
  const { user, logout } = useSession()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const join = async () => {
    setError(null)
    setMessage(null)
    try {
      const room = await api.joinClassroom(code.trim())
      setMessage(`You joined ${room.name}! 🎉`)
      setCode('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join class')
    }
  }

  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>You're exploring as a guest</Text>
        <Text style={styles.text}>
          Create an account to keep your progress, join your Sunday school class and appear on the leaderboard.
        </Text>
        <Button title="Create account" onPress={() => router.push('/auth/register')} />
        <Button title="Log in" variant="secondary" onPress={() => router.push('/auth/login')} />
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Hi, {user.display_name} 👋</Text>
      <Text style={styles.text}>{user.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join your class</Text>
        <Field
          label="Class code from your teacher"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={12}
        />
        <ErrorText message={error} />
        {message && <Text style={{ color: colors.success, fontSize: 15 }}>{message}</Text>}
        <Button title="Join class" onPress={join} disabled={code.trim().length < 4} />
      </View>

      <Button
        title="Log out"
        variant="secondary"
        onPress={async () => {
          await logout()
          router.replace('/')
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  text: { fontSize: 16, color: colors.muted },
  card: { gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
})
