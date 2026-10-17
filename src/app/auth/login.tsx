import { useState } from 'react'
import { router } from 'expo-router'
import { ScrollView, StyleSheet } from 'react-native'
import { Button, ErrorText, Field } from '../../components/ui'
import { useSession } from '../../state/session'

export default function Login() {
  const { login } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await login(email.trim(), password)
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
      <ErrorText message={error} />
      <Button title={busy ? 'Logging in…' : 'Log in'} onPress={submit} disabled={!email || !password || busy} />
      <Button title="New here? Create an account" variant="secondary" onPress={() => router.replace('/auth/register')} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
})
