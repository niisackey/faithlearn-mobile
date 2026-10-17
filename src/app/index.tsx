import { Redirect } from 'expo-router'
import { Loading } from '../components/ui'
import { useSession } from '../state/session'

export default function Index() {
  const { ready, hasIdentity } = useSession()
  if (!ready) return <Loading />
  return <Redirect href={hasIdentity ? '/(tabs)' : '/onboarding'} />
}
