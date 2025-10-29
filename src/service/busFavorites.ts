import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'bus_favorites_v1';

export async function getFavorites(): Promise<string[]> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v ? JSON.parse(v) : [];
  } catch (_) {
    return [];
  }
}

export async function setFavorites(ids: string[]) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(ids)); } catch (_) {}
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const current = await getFavorites();
  const has = current.includes(id);
  const next = has ? current.filter(x => x !== id) : [...current, id];
  await setFavorites(next);
  return next;
}

