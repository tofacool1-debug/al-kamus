import { openDB, DBSchema, IDBPDatabase } from "idb";
import { indexedDB as fakeIDB } from "fake-indexeddb";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { DictionaryEntry } from "../types";
import { Platform } from "react-native";
import { safeStorage } from "../utils/safeStorage";

const isWeb = Platform.OS === "web";

// Safe IndexedDB polyfill for sandboxed iframes
if (isWeb) {
  try {
    const testAccess = globalThis.indexedDB;
    if (!testAccess) {
      Object.defineProperty(globalThis, "indexedDB", {
        value: fakeIDB,
        configurable: true,
        writable: true
      });
    }
  } catch (e) {
    try {
      Object.defineProperty(globalThis, "indexedDB", {
        value: fakeIDB,
        configurable: true,
        writable: true
      });
    } catch (err) {
      console.warn("Could not polyfill indexedDB with fake-indexeddb:", err);
    }
  }
}

// In-memory fallback stores
const memKamus = new Map<string, DictionaryEntry>();
const memSettings = new Map<string, unknown>();

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
      if (!database.objectStoreNames.contains("kamus")) {
        database.createObjectStore("kamus", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("settings")) {
        database.createObjectStore("settings");
      }
    },
  });

  return db;
}

export async function initDB() {
  if (isWeb) {
    try {
      await ensureIDB();
    } catch (e) {
      console.warn("initDB: failed to open IndexedDB, falling back to memory:", e);
    }
  }
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
      try {
        const currentDb = await ensureIDB();
        return await currentDb.getAll("kamus");
      } catch (err) {
        console.warn("dbKamus.getAll failed, using memory fallback:", err);
        return Array.from(memKamus.values());
      }
    }

    const raw = await safeStorage.getItem("kamus_v1");
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
      try {
        const currentDb = await ensureIDB();
        const tx = currentDb.transaction("kamus", "readwrite");
        for (let i = 0; i < entries.length; i += 1) {
          await tx.store.put(entries[i]);
          onProgress?.(i + 1, entries.length);
        }
        await tx.done;
        return;
      } catch (err) {
        console.warn("dbKamus.bulkPut failed, using memory fallback:", err);
        for (let i = 0; i < entries.length; i += 1) {
          memKamus.set(entries[i].id, entries[i]);
          onProgress?.(i + 1, entries.length);
        }
        return;
      }
    }

    // Native: overwrite the whole list for simplicity
    await safeStorage.setItem("kamus_v1", JSON.stringify(entries));
    onProgress?.(entries.length, entries.length);
  },
  async clear() {
    if (isWeb) {
      try {
        const currentDb = await ensureIDB();
        await currentDb.clear("kamus");
        return;
      } catch (err) {
        console.warn("dbKamus.clear failed, using memory fallback:", err);
        memKamus.clear();
        return;
      }
    }

    await safeStorage.setItem("kamus_v1", JSON.stringify([]));
  },
};

export const dbSettings = {
  async get<T>(key: string): Promise<T | undefined> {
    if (isWeb) {
      try {
        const currentDb = await ensureIDB();
        return (await currentDb.get("settings", key)) as T | undefined;
      } catch (err) {
        console.warn("dbSettings.get failed, using memory fallback:", err);
        return memSettings.get(key) as T | undefined;
      }
    }

    const raw = await safeStorage.getItem("settings_v1");
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
      try {
        const currentDb = await ensureIDB();
        await currentDb.put("settings", value, key);
        return;
      } catch (err) {
        console.warn("dbSettings.set failed, using memory fallback:", err);
        memSettings.set(key, value);
        return;
      }
    }

    const raw = await safeStorage.getItem("settings_v1");
    let obj: Record<string, unknown> = {};
    try {
      obj = raw ? JSON.parse(raw) : {};
    } catch {
      obj = {};
    }
    obj[key] = value;
    await safeStorage.setItem("settings_v1", JSON.stringify(obj));
  },
  async remove(key: string) {
    if (isWeb) {
      try {
        const currentDb = await ensureIDB();
        await currentDb.delete("settings", key);
        return;
      } catch (err) {
        console.warn("dbSettings.remove failed, using memory fallback:", err);
        memSettings.delete(key);
        return;
      }
    }

    const raw = await safeStorage.getItem("settings_v1");
    if (!raw) return;
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      delete obj[key];
      await safeStorage.setItem("settings_v1", JSON.stringify(obj));
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

    if (isWeb) {
      try {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shorof-backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Web backup export failed:", err);
      }
      return;
    }

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
    if (isWeb) {
      return new Promise<boolean>((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (!file) {
            resolve(false);
            return;
          }
          const reader = new FileReader();
          reader.onload = async (evt: any) => {
            try {
              const text = evt.target.result;
              const data = JSON.parse(text);
              await dbKamus.clear();
              await dbKamus.bulkPut(data.kamus ?? []);
              if (data.isPremium) await dbSettings.set("isPremium_v2", true);
              resolve(true);
            } catch (err) {
              console.error("Web backup import failed:", err);
              resolve(false);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }

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