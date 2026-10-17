import { useState } from 'react'
import { router } from 'expo-router'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, ErrorText, Field } from '../components/ui'
import { useSession } from '../state/session'
import { colors } from '../theme'

const AGES = Array.from({ length: 13 }, (_, i) => i + 3) // 3–15

export default function Onboarding() {
  const { startAsGuest } = useSession()
  const [age, setAge] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    if (age === null) return
    setBusy(true)
    setError(null)
    try {
      await startAsGuest(age, name.trim() || undefined)
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.hello}>👋 Welcome to faithlearn</Text>
          <Text style={styles.sub}>Bible stories, songs and quizzes made for you.</Text>

          <Text style={styles.question}>How old are you?</Text>
          <View style={styles.ages}>
            {AGES.map((a) => (
              <Pressable
                key={a}
                accessibilityRole="button"
                accessibilityState={{ selected: age === a }}
                onPress={() => setAge(a)}
                style={[styles.age, age === a && styles.ageSelected]}
              >
                <Text style={[styles.ageText, age === a && { color: colors.primaryText }]}>{a}</Text>
              </Pressable>
            ))}
          </View>

          <Field label="What should we call you? (optional)" value={name} onChangeText={setName} maxLength={40} />

          <ErrorText message={error} />
          <Button title={busy ? 'Getting ready…' : "Let's go!"} onPress={start} disabled={age === null || busy} />
          <Button title="I already have an account" variant="secondary" onPress={() => router.push('/auth/login')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, gap: 20 },
  hello: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 24 },
  sub: { fontSize: 17, color: colors.muted },
  question: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 8 },
  ages: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  age: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  ageText: { fontSize: 20, fontWeight: '700', color: colors.text },
})
