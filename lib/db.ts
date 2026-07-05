import { openDB, DBSchema, IDBPDatabase } from "idb";
import "fake-indexeddb/auto";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { DictionaryEntry } from "../types"; // sesuaikan

interface AppDB extends DBSchema {
  kamus: { key: string; value: DictionaryEntry; };
  settings: { key: string; value: any; }
}

let db: IDBPDatabase<AppDB>;

export async function initDB() {
  db = await openDB<AppDB>("shorof-app-db", 1, {
    upgrade(db) {
      db.createObjectStore("kamus", { keyPath: "id" });
      db.createObjectStore("settings");
    },
  });
}

// 1. HELPER KAMUS
export const dbKamus = {
  async getAll(): Promise<DictionaryEntry[]> {
    return await db.getAll("kamus");
  },
  async count(): Promise<number> {
    return await db.count("kamus");
  },
  async bulkPut(entries: DictionaryEntry[], onProgress?: (done: number, total: number) => void) {
    const tx = db.transaction("kamus", "readwrite");
    for(let i = 0; i < entries.length; i++) {
      await tx.store.put(entries[i]);
      onProgress?.(i + 1, entries.length);
    }
    await tx.done;
  },
  async clear() {
    await db.clear("kamus");
  }
};

// 2. HELPER SETTINGS
export const dbSettings = {
  async get<T>(key: string): Promise<T | undefined> {
    return await db.get("settings", key);
  },
  async set(key: string, value: any) {
    await db.put("settings", value, key);
  },
  async remove(key: string) {
    await db.delete("settings", key);
  }
};

// 3. HELPER BACKUP
export const dbBackup = {
  async exportDB() {
    const allData = await dbKamus.getAll();
    const isPremium = await dbSettings.get("isPremium_v2");
    const jsonString = JSON.stringify({ kamus: allData, isPremium, version: "1.0" });
    const fileUri = FileSystem.documentDirectory + 'shorof-backup.json';
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    await Sharing.shareAsync(fileUri);
  },
  async importDB() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled) return false;
    const jsonString = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const data = JSON.parse(jsonString);
    await dbKamus.clear();
    await dbKamus.bulkPut(data.kamus);
    if(data.isPremium) await dbSettings.set("isPremium_v2", true);
    return true;
  }
};