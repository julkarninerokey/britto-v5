import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setAsyncStoreData(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    throw error;
  }
}

export async function getAsyncStoreData(key: string): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
}

export async function removeAsyncStoreData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
}

export async function clearAsyncStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing async storage:', error);
    throw error;
  }
}
