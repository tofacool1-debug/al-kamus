import { openDB, DBSchema, IDBPDatabase } from "idb";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { DictionaryEntry } from "../types";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === "web";

// In-memory cache used in both environments
const tasrifCache = new Map<string, unknown>();

// --- Web (IndexedDB) implementation ---
interface AppDB extends DBSchema {
  kamus: { key: string; value: DictionaryEntry };
  settings: { key: string; value: unknown };
}

let db: IDBPDatabase<AppDB> | undefined;

async function ensureIDB() {
  if (db) return db;

  db = await openDB<AppDB>("shorof-app-db", 1, {
    upgrade(database) {
      database.createObjectStore("kamus", { keyPath: "id" });
      database.createObjectStore("settings");
    },
  });

  return db;
}

export async function initDB() {
  if (isWeb) {
    return ensureIDB();
  }
  // On native, AsyncStorage needs no initialization
  return Promise.resolve();
}

export async function getTasrifCache(key: string) {
  return tasrifCache.get(key);
}

export async function saveTasrifCache(key: string, data: unknown) {
  tasrifCache.set(key, data);
  return data;
}

export async function clearTasrifCache() {
  tasrifCache.clear();
}

// --- Storage API (same surface for web + native) ---
export const dbKamus = {
  async getAll(): Promise<DictionaryEntry[]> {
    if (isWeb) {
      const currentDb = await ensureIDB();
      return await currentDb.getAll("kamus");
    }

    const raw = await AsyncStorage.getItem("kamus_v1");
    try {
      return raw ? (JSON.parse(raw) as DictionaryEntry[]) : [];
    } catch {
      return [];
    }
  },
  async count(): Promise<number> {
    const all = await dbKamus.getAll();
    return all.length;
  },
  async bulkPut(entries: DictionaryEntry[], onProgress?: (done: number, total: number) => void) {
    if (isWeb) {
      const currentDb = await ensureIDB();
      const tx = currentDb.transaction("kamus", "readwrite");
      for (let i = 0; i < entries.length; i += 1) {
        await tx.store.put(entries[i]);
        onProgress?.(i + 1, entries.length);
      }
      await tx.done;
      return;
    }

    // Native: overwrite the whole list for simplicity
    await AsyncStorage.setItem("kamus_v1", JSON.stringify(entries));
    onProgress?.(entries.length, entries.length);
  },
  async clear() {
    if (isWeb) {
      const currentDb = await ensureIDB();
      await currentDb.clear("kamus");
      return;
    }

    await AsyncStorage.setItem("kamus_v1", JSON.stringify([]));
  },
};

export const dbSettings = {
  async get<T>(key: string): Promise<T | undefined> {
    if (isWeb) {
      const currentDb = await ensureIDB();
      return (await currentDb.get("settings", key)) as T | undefined;
    }

    const raw = await AsyncStorage.getItem("settings_v1");
    if (!raw) return undefined;
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      return obj[key] as T | undefined;
    } catch {
      return undefined;
    }
  },
  async set(key: string, value: unknown) {
    if (isWeb) {
      const currentDb = await ensureIDB();
      await currentDb.put("settings", value, key);
      return;
    }

    const raw = await AsyncStorage.getItem("settings_v1");
    let obj: Record<string, unknown> = {};
    try {
      obj = raw ? JSON.parse(raw) : {};
    } catch {
      obj = {};
    }
    obj[key] = value;
    await AsyncStorage.setItem("settings_v1", JSON.stringify(obj));
  },
  async remove(key: string) {
    if (isWeb) {
      const currentDb = await ensureIDB();
      await currentDb.delete("settings", key);
      return;
    }

    const raw = await AsyncStorage.getItem("settings_v1");
    if (!raw) return;
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      delete obj[key];
      await AsyncStorage.setItem("settings_v1", JSON.stringify(obj));
    } catch {
      // ignore
    }
  },
};

export const dbBackup = {
  async exportDB() {
    const allData = await dbKamus.getAll();
    const isPremium = await dbSettings.get("isPremium_v2");
    const jsonString = JSON.stringify({ kamus: allData, isPremium, version: "1.0" });
    const fileSystemWithDirs = FileSystem as typeof FileSystem & {
      documentDirectory?: string;
      cacheDirectory?: string;
    };
    const baseDir = fileSystemWithDirs.documentDirectory ?? fileSystemWithDirs.cacheDirectory ?? "";
    const fileUri = `${baseDir}shorof-backup.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    await Sharing.shareAsync(fileUri);
  },
  async importDB() {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
    if (result.canceled) return false;

    const asset = result.assets?.[0];
    if (!asset) return false;

    const jsonString = await FileSystem.readAsStringAsync(asset.uri);
    const data = JSON.parse(jsonString);
    await dbKamus.clear();
    await dbKamus.bulkPut(data.kamus ?? []);
    if (data.isPremium) await dbSettings.set("isPremium_v2", true);
    return true;
  },
};