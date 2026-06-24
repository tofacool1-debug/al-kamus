import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('shorof_bab1.db');

export default function App() {
  const [fa, setFa] = useState('ن');
  const [ain, setAin] = useState('ص');
  const [lam, setLam] = useState('ر');
  const [data, setData] = useState(null);

  // 1. Bikin tabel + seed data ن-ص-ر pas pertama buka
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(`DROP TABLE IF EXISTS bab1`);
      tx.executeSql(
        `CREATE TABLE bab1 (
          fa TEXT, ain TEXT, lam TEXT,
          madhi TEXT, mudhari TEXT, mashdar TEXT
        );`
      );
      // Contoh نَصَرَ - Bab 1: فَعَلَ يَفْعُلُ
      tx.executeSql(
        `INSERT INTO bab1 VALUES ('ن','ص','ر','نَصَرَ','يَنْصُرُ','نَصْرًا')`
      );
    }, null, () => loadData());
  }, []);

  // 2. Ambil data dari DB offline
  const loadData = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM bab1 WHERE fa=? AND ain=? AND lam=?`,
        [fa, ain, lam],
        (_, { rows }) => setData(rows._array[0] || null)
      );
    });
  };

  // 3. Generate tasrif madhi sederhana Bab 1
  const tasrifMadhi = (fa, ain, lam) => {
    return [
      `هُوَ ${fa}َ${ain}َ${lam}َ`, // نَصَرَ
      `هُمَا ${fa}َ${ain}َ${lam}َا`, // نَصَرَا
      `هُمْ ${fa}َ${ain}َ${lam}ُوا`, // نَصَرُوا
      `هِيَ ${fa}َ${ain}َ${lam}َتْ`, // نَصَرَتْ
      `هُمَا ${fa}َ${ain}َ${lam}َتَا`, // نَصَرَتَا
      `هُنَّ ${fa}َ${ain}َ${lam}ْنَ`, // نَصَرْنَ
      `أَنْتَ ${fa}َ${ain}َ${lam}ْتَ`, // نَصَرْتَ
      `أَنْتُمَا ${fa}َ${ain}َ${lam}ْتُمَا`,
      `أَنْتُمْ ${fa}َ${ain}َ${lam}ْتُمْ`,
      `أَنْتِ ${fa}َ${ain}َ${lam}ْتِ`,
      `أَنْتُمَا ${fa}َ${ain}َ${lam}ْتُمَا`,
      `أَنْتُنَّ ${fa}َ${ain}َ${lam}ْتُنَّ`,
      `أَنَا ${fa}َ${ain}َ${lam}ْتُ`, // نَصَرْتُ
      `نَحْنُ ${fa}َ${ain}َ${lam}ْنَا` // نَصَرْنَا
    ];
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Shorof Bab 1 - فَعَلَ يَفْعُلُ</Text>
      <Text style={styles.subtitle}>Contoh: نَصَرَ يَنْصُرُ نَصْرًا</Text>

      <View style={styles.row}>
        <TextInput style={styles.input} value={fa} onChangeText={setFa} maxLength={1} placeholder="ف" />
        <TextInput style={styles.input} value={ain} onChangeText={setAin} maxLength={1} placeholder="ع" />
        <TextInput style={styles.input} value={lam} onChangeText={setLam} maxLength={1} placeholder="ل" />
      </View>

      <Text style={styles.btn} onPress={loadData}>Tampilkan</Text>

      {data? (
        <View style={styles.card}>
          <Text style={styles.arabic}>الماضي: {data.madhi}</Text>
          <Text style={styles.arabic}>المضارع: {data.mudhari}</Text>
          <Text style={styles.arabic}>المصدر: {data.mashdar}</Text>

          <Text style={styles.section}>تصريف الماضي:</Text>
          {tasrifMadhi(fa, ain, lam).map((t, i) => (
            <Text key={i} style={styles.arabicSmall}>{t}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Data tidak ditemukan. Coba ن ص ر</Text>
      )}
