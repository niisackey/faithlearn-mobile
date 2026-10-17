import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SessionProvider } from '../state/session'
import { colors } from '../theme'

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[id]" options={{ title: '' }} />
        <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz time!' }} />
        <Stack.Screen name="auth/login" options={{ title: 'Log in' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Create account' }} />
      </Stack>
    </SessionProvider>
  )
}
