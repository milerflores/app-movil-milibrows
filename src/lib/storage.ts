import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const key = 'milibrows.cliente.token';
export async function readToken() {
  if (Platform.OS === 'web')
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}
export async function saveToken(value: string | null) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      if (value) window.sessionStorage.setItem(key, value);
      else window.sessionStorage.removeItem(key);
    }
    return;
  }
  if (value) await SecureStore.setItemAsync(key, value);
  else await SecureStore.deleteItemAsync(key);
}
