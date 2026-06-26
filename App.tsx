import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite/legacy';
import { Asset } from 'expo-asset';

// 1. GANTI LINK INI PAKE LINK .SQLITE LU NANTI
const DB_URL = 'https://pbxcwdrveroydlgmljnk.supabase.co/storage/v1/object/public/shorof.db/shorof.sqlite';
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
import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { WebView } from "react-native-webview";
import { ShorofDbProvider, useShorofDbProvider } from "./context/ShorofDbProvider";
import { useShorofDb, SQLiteDictionaryRow } from "./hooks/useShorofDb";

// A mini Lucide-like custom component for Expo since React Native imports SVG differently
function SearchIcon() {
  return <Text style={{ color: "#a1a1aa", fontSize: 16 }}>🔍</Text>;
}

function MainScreen() {
  const { isDbReady, isLoading, results, searchDictionary, favorites, addFavorite, deleteFavorite } = useShorofDb();
  const { dbSizeMB } = useShorofDbProvider();
  const [keyword, setKeyword] = useState("");
  
  // Dual layout mode: "webview" (default primary interactive) or "native" (fast local database browser)
  const [viewMode, setViewMode] = useState<"webview" | "native">("webview");
  
  // Mutable URL for loading webapp in WebView
  const [webUrl, setWebUrl] = useState("https://ais-dev-zciegprt5uzrn4hupkz7vb-859970137966.asia-east1.run.app");
  const [isUrlEditing, setIsUrlEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState(webUrl);

  const webViewRef = useRef<WebView>(null);

  // Sync state to WebView whenever favorites update natively
  useEffect(() => {
    if (viewMode === "webview" && isDbReady && favorites) {
      const timer = setTimeout(() => {
        const message = JSON.stringify({
          type: "SET_FAVORITES",
          data: favorites
        });
        webViewRef.current?.postMessage(message);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [favorites, viewMode, isDbReady]);

  // Handle message requests from WebView
  const handleWebViewMessage = async (event: any) => {
    try {
      const dataString = event.nativeEvent.data;
      const message = JSON.parse(dataString);
      console.log("[Native Bridge Received]:", message);

      if (message.type === "GET_FAVORITES") {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_FAVORITES",
            data: favorites
          })
        );
      } else if (message.type === "ADD_FAVORITE") {
        const payload = message.payload;
        await addFavorite({
          id: payload.id,
          fa: payload.fa,
          ain: payload.ain,
          lam: payload.lam,
          translation: payload.translation,
          babNum: payload.babNum,
          notes: payload.notes || "Ditambahkan dari WebView Bridge"
        });
      } else if (message.type === "DELETE_FAVORITE") {
        const payload = message.payload;
        await deleteFavorite(payload.id);
      }
    } catch (err) {
      console.warn("[Bridge Warning] Gagal mengolah pesan WebView:", err);
    }
  };

  const handleSearch = (text: string) => {
    setKeyword(text);
    searchDictionary({
      searchQuery: text,
      limit: 15
    });
  };

  const isFavorited = (item: SQLiteDictionaryRow) => {
    return favorites.some((fav) => fav.id === item.id);
  };

  const toggleFavorite = (item: SQLiteDictionaryRow) => {
    if (isFavorited(item)) {
      deleteFavorite(item.id);
    } else {
      addFavorite({
        id: item.id,
        fa: item.fa,
        ain: item.ain,
        lam: item.lam,
        translation: item.translation,
        babNum: item.bab_num,
        notes: "Belajar luring via Expo SQLite"
      });
    }
  };

  const handleWebViewLoadEnd = () => {
    // Send configuration state and initial database rows to WebView on finish
    const payload = JSON.stringify({
      type: "SQLITE_STATUS",
      ready: true,
      dbSizeMB: dbSizeMB
    });
    webViewRef.current?.postMessage(payload);

    // Sync current favorites
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "SET_FAVORITES",
        data: favorites
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Dynamic View Mode Switcher Header */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, viewMode === "webview" && styles.tabButtonActive]}
          onPress={() => setViewMode("webview")}
        >
          <Text style={[styles.tabButtonText, viewMode === "webview" && styles.tabButtonTextActive]}>
            🌐 Kamus Utama (WebView)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, viewMode === "native" && styles.tabButtonActive]}
          onPress={() => setViewMode("native")}
        >
          <Text style={[styles.tabButtonText, viewMode === "native" && styles.tabButtonTextActive]}>
            📦 Cari Luring (SQLite)
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "webview" ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          {/* WebView URL configuration panel */}
          <View style={styles.urlBar}>
            {isUrlEditing ? (
              <View style={styles.urlEditRow}>
                <TextInput
                  style={styles.urlInput}
                  value={tempUrl}
                  onChangeText={setTempUrl}
                  placeholder="Masukkan Alamat Web (URL)..."
                  placeholderTextColor="#64748b"
                />
                <TouchableOpacity 
                  style={styles.urlSaveBtn}
                  onPress={() => {
                    setWebUrl(tempUrl);
                    setIsUrlEditing(false);
                  }}
                >
                  <Text style={styles.urlSaveText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.urlDisplayRow}>
                <Text style={styles.urlLabel} numberOfLines={1}>
                  Alamat Applet: {webUrl}
                </Text>
                <TouchableOpacity onPress={() => setIsUrlEditing(true)}>
                  <Text style={styles.urlEditLink}>Ubah</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Embedded Full Fidelity Webview */}
          <WebView
            ref={webViewRef}
            source={{ uri: webUrl }}
            style={{ flex: 1, backgroundColor: "#020617" }}
            onMessage={handleWebViewMessage}
            onLoadEnd={handleWebViewLoadEnd}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.absoluteLoader}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loaderText}>Menghubungkan ke Kamus Utama...</Text>
              </View>
            )}
          />
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Header info */}
          <View style={styles.header}>
            <View style={styles.headerBadgeContainer}>
              <Text style={styles.headerBadge}>OFFLINE-FIRST ACTIVE</Text>
              <Text style={styles.dbSizeText}>📦 SQLite: {dbSizeMB} MB</Text>
            </View>
            <Text style={styles.title}>Kamus Shorof Mobile</Text>
            <Text style={styles.subtitle}>Aplikasi Android/iOS Luring murni terhubung SQLite</Text>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <SearchIcon />
              <TextInput
                style={styles.input}
                placeholder="Cari akar kata (fa, ain, lam) atau terjemahan..."
                placeholderTextColor="#71717a"
                value={keyword}
                onChangeText={handleSearch}
              />
              {keyword.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <Text style={styles.clearBtn}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Loader or FlatList */}
          {!isDbReady ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loaderText}>Inisialisasi SQLite Database...</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {keyword ? "Tidak ada akar kata yang cocok." : "Ketik huruf hijaiyah atau terjemahan arti di atas."}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.babLabel}>Bab {item.bab_num}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(item)}>
                      <Text style={[styles.favHeart, isFavorited(item) ? styles.favActive : styles.favInactive]}>
                        {isFavorited(item) ? "★" : "☆"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rootRow}>
                    <View style={styles.rootBox}>
                      <Text style={styles.rootArabic}>{item.fa} - {item.ain} - {item.lam}</Text>
                      <Text style={styles.binaLabel}>{item.bina || "Shohih"}</Text>
                    </View>
                    <View style={styles.translationBox}>
                      <Text style={styles.translationText}>{item.translation}</Text>
                      {item.asal && (
                        <Text style={styles.asalText}>Asal: {item.asal}</Text>
                      )}
                    </View>
                  </View>

                  {item.explanation ? (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText} numberOfLines={2}>
                        {item.explanation}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* Synchronized Status Bottom Indicator */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          Tersimpan di SQLite Lokal: <Text style={styles.favCount}>{favorites.length}</Text> Favorit Ter-sinkron
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ShorofDbProvider>
      <MainScreen />
    </ShorofDbProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617"
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    padding: 6
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: "#1e293b"
  },
  tabButtonText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "bold"
  },
  tabButtonTextActive: {
    color: "#10b981"
  },
  urlBar: {
    backgroundColor: "#0b1329",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 16
  },
  urlDisplayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  urlLabel: {
    color: "#475569",
    fontSize: 10,
    flex: 1,
    marginRight: 8
  },
  urlEditLink: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "bold"
  },
  urlEditRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  urlInput: {
    flex: 1,
    height: 28,
    color: "#f1f5f9",
    fontSize: 11,
    paddingHorizontal: 8,
    backgroundColor: "#020617",
    borderRadius: 4,
    borderColor: "#1e293b",
    borderWidth: 1
  },
  urlSaveBtn: {
    marginLeft: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  urlSaveText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold"
  },
  absoluteLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  headerBadgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  headerBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  dbSizeText: {
    color: "#a1a1aa",
    fontSize: 10,
    fontWeight: "600"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f8fafc"
  },
  subtitle: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44
  },
  input: {
    flex: 1,
    color: "#f1f5f9",
    fontSize: 13,
    paddingLeft: 8
  },
  clearBtn: {
    color: "#a1a1aa",
    fontSize: 18,
    paddingHorizontal: 8
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loaderText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 10
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center"
  },
  emptyText: {
    color: "#4b5563",
    fontSize: 13,
    textAlign: "center"
  },
  itemCard: {
    backgroundColor: "#0b1329",
    borderRadius: 16,
    borderColor: "#1e293b",
    borderWidth: 1,
    padding: 14,
    marginBottom: 12
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  babLabel: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  favHeart: {
    fontSize: 18
  },
  favActive: {
    color: "#fbbf24"
  },
  favInactive: {
    color: "#4b5563"
  },
  rootRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rootBox: {
    flex: 1.2
  },
  rootArabic: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34d399",
    textAlign: "left"
  },
  binaLabel: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2
  },
  translationBox: {
    flex: 2,
    alignItems: "flex-end"
  },
  translationText: {
    color: "#f1f5f9",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right"
  },
  asalText: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2
  },
  explanationBox: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    marginTop: 10,
    paddingTop: 8
  },
  explanationText: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 15
  },
  bottomBar: {
    backgroundColor: "#0b1329",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    alignItems: "center"
  },
  bottomText: {
    color: "#64748b",
    fontSize: 11
  },
  favCount: {
    color: "#f1f5f9",
    fontWeight: "bold"
  }
});
