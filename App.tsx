import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const DB_NAME = 'shorof.sqlite';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
// GANTI LINK INI KE SERVER LU
const VERSION_URL = 'https://raw.githubusercontent.com/username/repo/main/version.json';

let db: SQLite.SQLiteDatabase;

const initDB = async () => {
  try {
    // 1. Ambil versi DB dari server
    const res = await fetch(VERSION_URL);
    const { version, url } = await res.json();
    
    // 2. Cek versi lokal
    const localVersion = await AsyncStorage.getItem('db_version');
    
    // 3. Kalau beda versi atau DB belum ada → download
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
    if (!fileInfo.exists || localVersion !== String(version)) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });
      
      Alert.alert('Update Database', 'Downloading data kamus terbaru...');
      await FileSystem.downloadAsync(url, DB_PATH);
      
      await AsyncStorage.setItem('db_version', String(version));
      console.log('DB update ke versi', version);
    }
    
    // 4. Buka DB yg udah didownload
    db = await SQLite.openDatabaseAsync(DB_NAME);
    return true;
  } catch (e) {
    console.error('Gagal init DB:', e);
    Alert.alert('Error', 'Gagal load database. Cek internet + link version.json');
    return false;
  }
}

export default function App() {
  const [fa, setFa] = useState('ن');
  const [ain, setAin] = useState('ص');
  const [lam, setLam] = useState('ر');
  const [hasil, setHasil] = useState<any>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      const success = await initDB(); // Ganti bagian CREATE TABLE jadi ini
      if (success) {
        cariData();
      }
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  const cariData = useCallback(async () => {
    if (!appReady || !db) return;
    const sql = 'SELECT * FROM bab1 WHERE fa = ? AND ain = ? AND lam = ? LIMIT 1';
    const row = await db.getFirstAsync(sql, [fa, ain, lam]);
    setHasil(row);
  }, [fa, ain, lam, appReady]);

  const tasrif = (f: string, a: string, l: string) => [
    `هُوَ ${f}َ${a}َ${l}َ`,
    `هُمَا ${f}َ${a}َ${l}َا`,
    `هُمْ ${f}َ${a}َ${l}ُوا`,
    `هِيَ ${f}َ${a}َ${l}َتْ`,
    `هُنَّ ${f}َ${a}َ${l}ْنَ`,
    `أَنْتَ ${f}َ${a}َ${l}ْتَ`,
    `أَنْتُمَا ${f}َ${a}َ${l}ْتُمَا`,
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite/legacy';
import { Asset } from 'expo-asset';

// 1. GANTI LINK INI PAKE LINK .SQLITE LU NANTI
const DB_URL = 'https://pbxcwdrveroydlgmljnk.supabase.co/storage/v1/object/public/db/shorof.sqlite';
const DB_NAME = 'shorof.db';

export default function App() {
  const [db, setDb] = useState<SQLite.WebSQLDatabase | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      const dbFile = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
      const dir = `${FileSystem.documentDirectory}SQLite`;
      
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const fileInfo = await FileSystem.getInfoAsync(dbFile);
      if (!fileInfo.exists) {
        console.log('Download DB...');
        const asset = Asset.fromURI(DB_URL);
        await asset.downloadAsync();
        await FileSystem.copyAsync({ from: asset.localUri!, to: dbFile });
      }

      const database = SQLite.openDatabase(DB_NAME);
      setDb(database);
      loadData(database);
    } catch (error) {
      console.log('Error init DB:', error);
      setLoading(false);
    }
  };

  const loadData = (database: SQLite.WebSQLDatabase) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM shorof LIMIT 100',
        [],
        (_, { rows }) => {
          setData(rows._array);
          setLoading(false);
        },
        (_, error) => {
          console.log('Error load:', error);
          return false;
        }
      );
    });
  };

  const searchData = (text: string) => {
    setSearch(text);
    if (!db) return;
    
    const query = `SELECT * FROM shorof WHERE 
      fa LIKE ? OR 
      ain LIKE ? OR 
      lam LIKE ? OR 
      translation LIKE ? 
      LIMIT 100`;
    const param = `%${text}%`;

    db.transaction(tx => {
      tx.executeSql(query, [param, param, param, param], (_, { rows }) => {
        setData(rows._array);
      });
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10 }}>Download database pertama kali...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Cari: ق و ل / Berkata..."
        value={search}
        onChangeText={searchData}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.arab}>{item.fa}{item.ain}{item.lam}</Text>
            <Text style={styles.arti}>{item.translation}</Text>
            <Text style={styles.bab}>Bab {item.babNum} | {item.bina}</Text>
            <Text style={styles.masdar}>Masdar: {item.masdarSamai} / {item.masdarQiyasi}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: { 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12,
    fontSize: 16 
  },
  card: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 10,
    elevation: 2 
  },
  arab: { fontSize: 24, fontWeight: 'bold', textAlign: 'right', marginBottom: 4 },
  arti: { fontSize: 16, color: '#333', marginBottom: 4 },
  bab: { fontSize: 12, color: '#666' },
  masdar: { fontSize: 12, color: '#2E7D32', marginTop: 4 }
});
