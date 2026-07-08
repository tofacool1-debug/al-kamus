import { openDB, DBSchema, IDBPDatabase } from "idb";
import "fake-indexeddb/auto";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { DictionaryEntry } from "../types";

interface AppDB extends DBSchema {
  kamus: { key: string; value: DictionaryEntry };
  settings: { key: string; value: unknown };
}

let db: IDBPDatabase<AppDB> | undefined;
const tasrifCache = new Map<string, unknown>();

async function ensureDB() {
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
  return ensureDB();
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

export const dbKamus = {
  async getAll(): Promise<DictionaryEntry[]> {
    const currentDb = await ensureDB();
    return await currentDb.getAll("kamus");
  },
  async count(): Promise<number> {
    const currentDb = await ensureDB();
    return await currentDb.count("kamus");
  },
  async bulkPut(entries: DictionaryEntry[], onProgress?: (done: number, total: number) => void) {
    const currentDb = await ensureDB();
    const tx = currentDb.transaction("kamus", "readwrite");
    for (let i = 0; i < entries.length; i += 1) {
      await tx.store.put(entries[i]);
      onProgress?.(i + 1, entries.length);
    }
    await tx.done;
  },
  async clear() {
    const currentDb = await ensureDB();
    await currentDb.clear("kamus");
  },
};

export const dbSettings = {
  async get<T>(key: string): Promise<T | undefined> {
    const currentDb = await ensureDB();
    return (await currentDb.get("settings", key)) as T | undefined;
  },
  async set(key: string, value: unknown) {
    const currentDb = await ensureDB();
    await currentDb.put("settings", value, key);
  },
  async remove(key: string) {
    const currentDb = await ensureDB();
    await currentDb.delete("settings", key);
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
