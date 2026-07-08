import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  SafeAreaView, Animated, Platform, ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import { PRESET_DICTIONARY } from "@/data/dictionary";
import { getVocalizedRoot, getTasrifIstilahi, getTasrifLughowi, getMasdar, getSifat, getJamak, getIilal } from "@/utils/tasrifEngine"; // [UBAH] import semua
import { getBabExplanation } from "@/utils/iilalEngine";
import { DictionaryEntry, TabType } from "@/types";
import DictionaryPanel from "@/components/DictionaryPanel";
import TasrifIstilahiTab from "@/components/tabs/TasrifIstilahiTab";
import TasrifLughowiTab from "@/components/tabs/TasrifLughowiTab";
import MasdarTab from "@/components/tabs/MasdarTab";
import SifatTab from "@/components/tabs/SifatTab";
import JamakTab from "@/components/tabs/JamakTab";
import IilalTab from "@/components/tabs/IilalTab";
import ProfileModal from "@/components/modals/ProfileModal";
import PremiumModal from "@/components/modals/PremiumModal";
import { getTasrifCache, saveTasrifCache, initDB } from "@/lib/db";

const TABS: { key: TabType; label: string; icon: string; premium: boolean }[] = [
  { key: "istilahi", label: "Istilahi", icon: "book-open", premium: false },
  { key: "lughowi", label: "Lughowi", icon: "list", premium: false },
  { key: "masdar", label: "Masdar", icon: "file-text", premium: false },
  { key: "sifat", label: "Sifat", icon: "star", premium: true },
  { key: "jama", label: "Jama'", icon: "layers", premium: true },
  { key: "iilal", label: "I'lal", icon: "zap", premium: false },
];

const AVATAR_COLORS: Record<string, string> = {
  avatar1: "#10b981", avatar2: "#3b82f6", avatar3: "#f59e0b",
  avatar4: "#d946ef", avatar5: "#f43f5e", avatar6: "#8b5cf6",
};

// [TAMBAH] Fungsi buat pilih engine sesuai tab
const getTasrifEngine = (tab: TabType) => {
  switch(tab) {
    case "istilahi": return getTasrifIstilahi;
    case "lughowi": return getTasrifLughowi;
    case "masdar": return getMasdar;
    case "sifat": return getSifat;
    case "jama": return getJamak;
    case "iilal": return getIilal;
    default: return null;
  }
}

export default function HomeScreen() {
  const { appTheme, tc, isPremium, username, profilePhoto, isFavorited, toggleFavorite } = useAppContext();

  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(PRESET_DICTIONARY[0]);
  const [activeTab, setActiveTab] = useState<TabType>("istilahi");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBabInfo, setShowBabInfo] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [tasrifData, setTasrifData] = useState<any>(null); // cache semua tab
  const [loadingTasrif, setLoadingTasrif] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const setup = async () => {
      await initDB();
      setDbReady(true);
    };
    setup();
  }, []);

  useEffect(() => {
    if (toastMsg) {
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToastMsg(""));
    }
  }, [toastMsg]);

  // [UBAH TOTAL] useEffect load dari IndexedDB untuk semua tab
  useEffect(() => {
    if (!dbReady) return;
    const loadTasrif = async () => {
      setLoadingTasrif(true);
      const key = `${selectedEntry.id}-${activeTab}`;

      let data = await getTasrifCache(key); // 1. Cek Cache

      if (!data) {
        const engine = getTasrifEngine(activeTab); // 2. Ambil fungsi yang benar
        if (engine) {
          data = engine(selectedEntry); // 3. Hitung
          if (data) await saveTasrifCache(key, data); // 4. Simpan ke Cache
        }
      }
      setTasrifData(data);
      setLoadingTasrif(false);
    };
    loadTasrif();
  }, [selectedEntry, activeTab, dbReady]);

  const showToast = (msg: string) => setToastMsg(msg);

  const babInfo = useMemo(() => getBabExplanation(selectedEntry.babNum), [selectedEntry.babNum]);
  const avatarColor = AVATAR_COLORS[profilePhoto]?? "#10b981";
  const avatarLetter = username.charAt(0).toUpperCase() || "S";
  const isCurrentlyFavorited = isFavorited(selectedEntry.id);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setActiveTab("istilahi");
  };

  const handleTabPress = (tab: typeof TABS[0]) => {
    if (tab.premium &&!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setActiveTab(tab.key);
  }

  if (!dbReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: tc.textColor, marginTop: 8 }}>Memuat Database...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.bg }}>
      <StatusBar barStyle={appTheme === "light"? "dark-content" : "light-content"} backgroundColor={tc.header} />

      {/* HEADER */}
      <View style={{ backgroundColor: tc.header, borderBottomWidth: 1, borderBottomColor: tc.border, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ backgroundColor: "#059669", padding: 6, borderRadius: 8 }}><Feather name="book-open" size={16} color="#ffffff" /></View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "900", color: tc.headerText }}>Shorof Digital Pro</Text>
            <Text style={{ fontSize: 8, fontWeight: "600", color: tc.subText }}>Kamus Pintar Sharaf & Kaidah I'lal</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowProfileModal(true)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.profileBg, borderWidth: 1, borderColor: tc.profileBorder, padding: 4, borderRadius: 24, gap: 6 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: avatarColor, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>{avatarLetter}</Text></View>
          <Text style={{ fontSize: 10, fontWeight: "700", color: tc.headerText }}>{username}</Text>
          <Feather name="settings" size={10} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 24, gap: 14 }}>
        <DictionaryPanel selectedId={selectedEntry.id} onSelectEntry={handleSelectEntry} tc={tc} />

        <View style={{ backgroundColor: tc.card, borderWidth: 1, borderColor: tc.cardBorder, borderRadius: 24, padding: 16, gap: 14 }}>
          {/*... bagian header kata, bookmark, bab info sama... */}

          {/* TABS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const isLocked = tab.premium &&!isPremium;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleTabPress(tab)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 4,
                    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
                    backgroundColor: isActive? tc.tabBtnActive : tc.cardInner,
                    borderWidth: 1, borderColor: isActive? tc.tabBtnActive : tc.cardInnerBorder, opacity: isLocked? 0.5 : 1
                  }}
                >
                  <Feather name={tab.icon as any} size={11} color={isActive? tc.tabBtnActiveText : tc.subText} />
                  <Text style={{ fontSize: 10, fontWeight: "900", color: isActive? tc.tabBtnActiveText : tc.subText }}>{tab.label}</Text>
                  {isLocked && <Feather name="lock" size={10} color="#f59e0b" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TAB CONTENT */}
          <View style={{ minHeight: 200 }}>
            {loadingTasrif? (
              <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
                <ActivityIndicator color="#10b981" />
                <Text style={{color: tc.subText, marginTop: 8}}>Memuat...</Text>
              </View>
            ) : (
              <>
                {activeTab === "istilahi" && <TasrifIstilahiTab data={tasrifData} entry={selectedEntry} tc={tc} />}
                {activeTab === "lughowi" && <TasrifLughowiTab data={tasrifData} entry={selectedEntry} tc={tc} />}
                {activeTab === "masdar" && <MasdarTab data={tasrifData} entry={selectedEntry} tc={tc} />}
                {activeTab === "sifat" && <SifatTab data={tasrifData} entry={selectedEntry} tc={tc} />}
                {activeTab === "jama" && <JamakTab data={tasrifData} entry={selectedEntry} tc={tc} />}
                {activeTab === "iilal" && <IilalTab data={tasrifData} entry={selectedEntry} tc={tc} />}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER PREMIUM */}
      <View style={{ padding: 14, backgroundColor: tc.header, borderTopWidth: 1, borderTopColor: tc.border, alignItems: "center" }}>
        {isPremium? (
          <View style={{ backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name="award" size={14} color="#fbbf24" />
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24" }}>Premium Aktif</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setShowPremiumModal(true)} style={{ backgroundColor: "#fbbf24", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name="star" size={14} color="#020617" />
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#020617" }}>Aktifkan Premium</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!toastMsg && <Animated.View style={{ position: "absolute", bottom: 90, left: 20, right: 20, backgroundColor: "rgba(16,185,129,0.92)", borderRadius: 12, padding: 12, alignItems: "center", opacity: toastOpacity }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>{toastMsg}</Text></Animated.View>}
      <ProfileModal visible={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <PremiumModal visible={showPremiumModal} onClose={() => setShowPremiumModal(false)} onActivated={showToast} />
    </SafeAreaView>
  );
}
