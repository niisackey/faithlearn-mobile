import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// SecureStore is native-only; the web build falls back to localStorage.
export const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null
    return SecureStore.getItemAsync(key)
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return globalThis.localStorage?.setItem(key, value)
    return SecureStore.setItemAsync(key, value)
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') return globalThis.localStorage?.removeItem(key)
    return SecureStore.deleteItemAsync(key)
  },
}
