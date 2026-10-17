import { useState } from 'react'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { Button, ErrorText, Field } from '../../components/ui'
import { useSession } from '../../state/session'
import { colors } from '../../theme'

export default function Register() {
  const { register, guestId } = useSession()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guests already told us their age during onboarding.
  const needsAge = !guestId
  const ageNum = Number(age)
  const valid = displayName.trim() && email.trim() && password.length >= 8 && (!needsAge || (ageNum >= 3 && ageNum <= 120))

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await register({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        age: needsAge ? ageNum : undefined,
      })
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {guestId && <Text style={styles.note}>Your quiz stars so far will move to your new account.</Text>}
      <Field label="Name to show on the leaderboard" value={displayName} onChangeText={setDisplayName} maxLength={40} />
      <Field label="Email (a parent's is fine)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Field label="Password (at least 8 characters)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      {needsAge && <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />}
      <ErrorText message={error} />
      <Button title={busy ? 'Creating…' : 'Create account'} onPress={submit} disabled={!valid || busy} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  note: { fontSize: 15, color: colors.muted },
})
