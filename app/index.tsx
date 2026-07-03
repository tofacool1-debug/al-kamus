import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  SafeAreaView, Animated, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import { PRESET_DICTIONARY } from "@/data/dictionary";
import { getVocalizedRoot, getTasrifIstilahi } from "@/utils/tasrifEngine";
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

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "istilahi", label: "Istilahi", icon: "book-open" },
  { key: "lughowi",  label: "Lughowi",  icon: "list" },
  { key: "masdar",   label: "Masdar",   icon: "file-text" },
  { key: "sifat",    label: "Sifat",    icon: "star" },
  { key: "jama",     label: "Jama'",    icon: "layers" },
  { key: "iilal",    label: "I'lal",    icon: "zap" },
];

const AVATAR_COLORS: Record<string, string> = {
  avatar1: "#10b981", avatar2: "#3b82f6", avatar3: "#f59e0b",
  avatar4: "#d946ef", avatar5: "#f43f5e", avatar6: "#8b5cf6",
};

export default function HomeScreen() {
  const { appTheme, tc, isPremium, username, profilePhoto, isFavorited, toggleFavorite } = useAppContext();

  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(PRESET_DICTIONARY[0]);
  const [activeTab, setActiveTab] = useState<TabType>("istilahi");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBabInfo, setShowBabInfo] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toastMsg) {
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToastMsg(""));
    }
  }, [toastMsg]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const babInfo = useMemo(() => getBabExplanation(selectedEntry.babNum), [selectedEntry.babNum]);
  const avatarColor = AVATAR_COLORS[profilePhoto] ?? "#10b981";
  const avatarLetter = username.charAt(0).toUpperCase() || "S";
  const isCurrentlyFavorited = isFavorited(selectedEntry.id);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setActiveTab("istilahi");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.bg }}>
      <StatusBar
        barStyle={appTheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={tc.header}
      />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: tc.header,
        borderBottomWidth: 1,
        borderBottomColor: tc.border,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ backgroundColor: "#059669", padding: 6, borderRadius: 8 }}>
            <Feather name="book-open" size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "900", color: tc.headerText }}>Shorof Digital Pro</Text>
            <Text style={{ fontSize: 8, fontWeight: "600", color: tc.subText, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Kamus Pintar Sharaf & Kaidah I'lal
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowProfileModal(true)}
          style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.profileBg, borderWidth: 1, borderColor: tc.profileBorder, padding: 4, borderRadius: 24, gap: 6 }}
        >
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: avatarColor, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>{avatarLetter}</Text>
          </View>
          <Text style={{ fontSize: 10, fontWeight: "700", color: tc.headerText }}>{username}</Text>
          <Feather name="settings" size={10} color="#94a3b8" style={{ marginRight: 2 }} />
        </TouchableOpacity>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 24, gap: 14 }}>

        {/* Dictionary Panel */}
        <DictionaryPanel
          selectedId={selectedEntry.id}
          onSelectEntry={handleSelectEntry}
          tc={tc}
        />

        {/* ── WORD DETAIL CARD ── */}
        <View style={{ backgroundColor: tc.card, borderWidth: 1, borderColor: tc.cardBorder, borderRadius: 24, padding: 16, gap: 14 }}>

          {/* Badge row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981", textTransform: "uppercase" }}>
                  Bab {selectedEntry.babNum} — {selectedEntry.bina}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBabInfo((s) => !s)}
                style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: tc.border, alignItems: "center", justifyContent: "center" }}
              >
                <Feather name="info" size={11} color={tc.textColor} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                toggleFavorite(selectedEntry.id);
                showToast(isCurrentlyFavorited ? "Dihapus dari favorit" : "Ditambahkan ke favorit!");
              }}
              style={{
                width: 28, height: 28, borderRadius: 14,
                borderWidth: 1,
                borderColor: isCurrentlyFavorited ? "rgba(245,158,11,0.4)" : tc.border,
                backgroundColor: isCurrentlyFavorited ? "rgba(245,158,11,0.1)" : "transparent",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Feather name="bookmark" size={13} color={isCurrentlyFavorited ? "#fbbf24" : "#94a3b8"} />
            </TouchableOpacity>
          </View>

          {/* Arabic root display */}
          <View style={{ alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 36, fontWeight: "900", color: "#fbbf24", textAlign: "center", letterSpacing: 2 }}>
              {getVocalizedRoot(selectedEntry)}
            </Text>
            <Text style={{ fontSize: 13, color: tc.textColor, fontWeight: "500", textAlign: "center", fontStyle: "italic", paddingHorizontal: 12 }}>
              "{selectedEntry.translation}"
            </Text>
          </View>

          {/* Bab info box */}
          <View style={{ backgroundColor: "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: "rgba(16,185,129,0.1)", borderRadius: 14, padding: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <Feather name="star" size={10} color="#10b981" />
              <Text style={{ fontSize: 8, fontWeight: "900", color: "#10b981", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Karakteristik Bab {selectedEntry.babNum}
              </Text>
            </View>
            <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 13 }}>{babInfo.ringkas}</Text>
          </View>

          {/* Bab Info Extended (collapsible) */}
          {showBabInfo && (
            <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 14, padding: 12, gap: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: "900", color: tc.accentText }}>{babInfo.vocal}</Text>
              <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 14 }}>{babInfo.karakteristik}</Text>
              <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 8, borderWidth: 1, borderColor: tc.border }}>
                <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 2 }}>Contoh:</Text>
                <Text style={{ fontSize: 9, color: tc.textColor, lineHeight: 14 }}>{babInfo.contoh}</Text>
              </View>
            </View>
          )}

          {/* ── TAB SELECTOR ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: isActive ? tc.tabBtnActive : tc.cardInner,
                    borderWidth: 1,
                    borderColor: isActive ? tc.tabBtnActive : tc.cardInnerBorder,
                  }}
                >
                  <Feather
                    name={tab.icon as any}
                    size={11}
                    color={isActive ? tc.tabBtnActiveText : tc.subText}
                  />
                  <Text style={{ fontSize: 10, fontWeight: "900", color: isActive ? tc.tabBtnActiveText : tc.subText }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── TAB CONTENT ── */}
          <View style={{ minHeight: 200 }}>
            {activeTab === "istilahi" && <TasrifIstilahiTab entry={selectedEntry} tc={tc} />}
            {activeTab === "lughowi"  && <TasrifLughowiTab  entry={selectedEntry} tc={tc} />}
            {activeTab === "masdar"   && <MasdarTab          entry={selectedEntry} tc={tc} />}
            {activeTab === "sifat"    && (
              <SifatTab entry={selectedEntry} tc={tc} isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)} />
            )}
            {activeTab === "jama"     && (
              <JamakTab entry={selectedEntry} tc={tc} isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)} />
            )}
            {activeTab === "iilal"    && <IilalTab           entry={selectedEntry} tc={tc} />}
          </View>
        </View>
      </ScrollView>

      {/* ── BOTTOM BAR ── */}
      <View style={{ padding: 14, backgroundColor: tc.header, borderTopWidth: 1, borderTopColor: tc.border, alignItems: "center" }}>
        {isPremium ? (
          <TouchableOpacity
            onPress={() => setShowPremiumModal(true)}
            style={{ backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Feather name="award" size={14} color="#fbbf24" />
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>
              Premium Terverifikasi & Aktif
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowPremiumModal(true)}
            style={{ backgroundColor: "#fbbf24", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Feather name="star" size={14} color="#020617" />
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#020617", textTransform: "uppercase" }}>
              Aktifkan Premium
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── TOAST ── */}
      {!!toastMsg && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 90,
            left: 20,
            right: 20,
            backgroundColor: "rgba(16,185,129,0.92)",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
            opacity: toastOpacity,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>{toastMsg}</Text>
        </Animated.View>
      )}

      {/* ── MODALS ── */}
      <ProfileModal visible={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onActivated={showToast}
      />
    </SafeAreaView>
  );
}
