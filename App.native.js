import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';

// Biar splash gak auto hide sebelum DB siap
SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabaseSync('shorof.db');

export default function App() {
  const [fa, setFa] = useState('ن');
  const [ain, setAin] = useState('ص');
  const [lam, setLam] = useState('ر');
  const [hasil, setHasil] = useState<any>(null);
  const [appReady, setAppReady] = useState(false);

  // 1. Init DB + hide splash pas udah siap
  useEffect(() => {
    async function prepare() {
      try {
        db.execSync(`
          CREATE TABLE IF NOT EXISTS bab1 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fa TEXT, ain TEXT, lam TEXT,
            madhi TEXT, mudhari TEXT, mashdar TEXT, makna TEXT
          );
        `);

        const count = db.getFirstSync('SELECT COUNT(*) as c FROM bab1');
        if (count.c === 0) {
          db.execSync(`
            INSERT INTO bab1 (fa, ain, lam, madhi, mudhari, mashdar, makna) VALUES
            ('ن','ص','ر','نَصَرَ','يَنْصُرُ','نَصْرًا','menolong'),
            ('ك','ت','ب','كَتَبَ','يَكْتُبُ','كِتَابَةً','menulis'),
            ('ف','ت','ح','فَتَحَ','يَفْتَحُ','فَتْحًا','membuka'),
            ('د','ر','س','دَرَسَ','يَدْرُسُ','دَرْسًا','belajar');
          `);
        }
        
        cariData();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync(); // Baru hide splash
      }
    }
    prepare();
  }, []);

  // 2. Fungsi cari DB offline
  const cariData = useCallback(() => {
    if (!appReady) return;
    const sql = 'SELECT * FROM bab1 WHERE fa = ? AND ain = ? AND lam = ? LIMIT 1';
    const row = db.getFirstSync(sql, [fa, ain, lam]);
    setHasil(row);
  }, [fa, ain, lam, appReady]);

  // 3. Tasrif Madhi Bab 1 فَعَلَ يَفْعُلُ
  const tasrif = (f: string, a: string, l: string) => [
    `هُوَ ${f}َ${a}َ${l}َ`,
    `هُمَا ${f}َ${a}َ${l}َا`,
    `هُمْ ${f}َ${a}َ${l}ُوا`,
    `هِيَ ${f}َ${a}َ${l}َتْ`,
    `هُنَّ ${f}َ${a}َ${l}ْنَ`,
    `أَنْتَ ${f}َ${a}َ${l}ْتَ`,
    `أَنْتُمَا ${f}َ${a}َ${l}ْتُمَا`,
    `أَنْتُمْ ${f}َ${a}َ${l}ْتُمْ`,
    `أَنْتِ ${f}َ${a}َ${l}ْتِ`,
    `أَنْتُنَّ ${f}َ${a}َ${l}ْتُنَّ`,
    `أَنَا ${f}َ${a}َ${l}ْتُ`,
    `نَحْنُ ${f}َ${a}َ${l}ْنَا`
  ];

  if (!appReady) return null; // Tahan di splash sampe DB siap

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Shorof Bab 1 Offline</Text>
      <Text style={styles.sub}>Wazan: فَعَلَ يَفْعُلُ</Text>

      <View style={styles.row}>
        <TextInput style={styles.input} value={fa} onChangeText={setFa} maxLength={1} placeholder="ف" />
        <TextInput style={styles.input} value={ain} onChangeText={setAin} maxLength={1} placeholder="ع" />
        <TextInput style={styles.input} value={lam} onChangeText={setLam} maxLength={1} placeholder="ل" />
      </View>

      <TouchableOpacity style={styles.btn} onPress={cariData}>
        <Text style={styles.btnText}>Cari Tashrif</Text>
      </TouchableOpacity>

      {hasil ? (
        <View style={styles.card}>
          <Text style={styles.arabic}>الماضي: {hasil.madhi}</Text>
          <Text style={styles.arabic}>المضارع: {hasil.mudhari}</Text>
          <Text style={styles.arabic}>المصدر: {hasil.mashdar}</Text>
          <Text style={styles.makna}>Makna: {hasil.makna}</Text>

          <Text style={styles.section}>تصريف الماضي:</Text>
          {tasrif(fa, ain, lam).map((t, i) => (
            <Text key={i} style={styles.arabicSmall}>{t}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Data tidak ada. Coba: ن ص ر / ك ت ب / ف ت ح / د ر س</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#1e293b' },
  sub: { fontSize: 16, textAlign: 'center', color: '#64748b', marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  input: {
    width: 70, height: 70, borderWidth: 2, borderColor: '#3b82f6',
    borderRadius: 14, fontSize: 34, textAlign: 'center', backgroundColor: 'white',
    fontWeight: '600'
  },
  btn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 14, marginBottom: 25, elevation: 3 },
  btnText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '700' },
  card: { backgroundColor: 'white', padding: 22, borderRadius: 18, elevation: 5 },
  arabic: { fontSize: 30, textAlign: 'right', marginVertical: 6, fontWeight: '500' },
  arabicSmall: { fontSize: 23, textAlign: 'right', marginVertical: 3 },
  makna: { fontSize: 17, color: '#475569', marginTop: 10, fontStyle: 'italic' },
  section: { fontSize: 19, fontWeight: 'bold', marginTop: 18, marginBottom: 10, color: '#1e293b' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 16 }
});
