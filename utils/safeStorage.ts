import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const memStore = new Map<string, string>();

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return await AsyncStorage.getItem(key);
      } catch (err) {
        console.warn(`safeStorage.getItem failed for key "${key}", using memory fallback:`, err);
        return memStore.get(key) ?? null;
      }
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.warn("AsyncStorage.getItem failed on native:", err);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        await AsyncStorage.setItem(key, value);
        return;
      } catch (err) {
        console.warn(`safeStorage.setItem failed for key "${key}", using memory fallback:`, err);
        memStore.set(key, value);
        return;
      }
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn("AsyncStorage.setItem failed on native:", err);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        await AsyncStorage.removeItem(key);
        return;
      } catch (err) {
        console.warn(`safeStorage.removeItem failed for key "${key}", using memory fallback:`, err);
        memStore.delete(key);
        return;
      }
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn("AsyncStorage.removeItem failed on native:", err);
    }
  },

  async clear(): Promise<void> {
    if (isWeb) {
      try {
        await AsyncStorage.clear();
        return;
      } catch (err) {
        console.warn("safeStorage.clear failed, using memory fallback:", err);
        memStore.clear();
        return;
      }
    }
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.warn("AsyncStorage.clear failed on native:", err);
    }
  }
};
