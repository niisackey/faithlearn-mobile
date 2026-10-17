import { Redirect, Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useSession } from '../../state/session'
import { colors } from '../../theme'

const icon = (emoji: string) => () => <Text style={{ fontSize: 22 }}>{emoji}</Text>

export default function TabsLayout() {
  const { ready, hasIdentity } = useSession()
  if (ready && !hasIdentity) return <Redirect href="/onboarding" />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Lessons', tabBarIcon: icon('📚') }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard', tabBarIcon: icon('🏆') }} />
      <Tabs.Screen name="profile" options={{ title: 'Me', tabBarIcon: icon('🙂') }} />
    </Tabs>
  )
}
