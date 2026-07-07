import React, { usestate } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Clipboard, Dimensions } from "react-native";
import { TasrifIstilahi, ShighotDetail } from "../types";
import { Info, Lock, ChevronLeft, ChevronRight } from "@expo/vector-icons";
import { IilalEngine } from "../../utils/iilalEngine";

interface TasrifIstilahiViewProps {
  tasrif: TasrifIstilahi;
  fa?: string;
  ain?: string;
  lam?: string;
  shorof?: any[];
  onShowWordInfo?: (word: string, shighot: string) => void;
  lafadzSize?: "small" | "medium" | "large" | "xlarge";
  layoutMode?: "scroll" | "slide";
  appTheme?: "dark" | "light" | "green";
}

const { width } = Dimensions.get('window');

export default function TasrifIstilahiView({
  tasrif,
  fa = "ف",
  ain = "ع",
  lam = "ل",
  shorof,
  onShowWordInfo,
  lafadzSize = "medium",
  layoutMode = "scroll",
  appTheme = "dark"
}: TasrifIstilahiViewProps) {
  const bina = IilalEngine.detectBina(fa, ain, lam);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const getCustomShorof = (cardTitle: string) => {
    if (!shorof) return null;
    let targetTitle = "";
    if (cardTitle === "Isim Fail") targetTitle = "Isim Fail";
    else if (cardTitle === "Isim Maful") targetTitle = "Isim Maful";
    else if (cardTitle === "Sifat Musyabihat") targetTitle = "Sifat Musyabihat";
    else if (["Isim Zaman", "Isim Makan", "Isim Alat"].includes(cardTitle)) targetTitle = "Isim Zaman Makan Alat";
    if (!targetTitle) return null;
    return shorof.find((s: any) => s.title === targetTitle);
  };

  const getArabicSize = () => {
    switch (lafadzSize) {
      case "small": return 14;
      case "large": return 22;
      case "xlarge": return 28;
      case "medium":
      default: return 18;
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const GRID_ITEMS = [
    { title: "Fi'il Madhi", subtitle: "Kata Kerja Lampau", arabicLabel: "الفِعْلُ المَاضِي", arabicWord: tasrif.madhi, description: "Menunjukkan pekerjaan yang telah selesai.", classification: "Qiyasi", variant: "emerald" },
    { title: "Fi'il Mudhari", subtitle: "Kata Kerja Sedang/Akan", arabicLabel: "الفِعْلُ المُضَارِعُ", arabicWord: tasrif.mudhari, description: "Menunjukkan pekerjaan sedang/akan berkegiatan.", classification: "Qiyasi", variant: "emerald" },
    { title: "Masdar", subtitle: "Nomina Tindakan", arabicLabel: "المَصْدَرُ", arabicWord: tasrif.masdar, description: "Menunjukkan nama/benda dari aktivitas kata kerja.", classification: "Sama'i / Qiyasi", variant: "emerald" },
    { title: "Isim Fail", subtitle: "Aktor / Pelaku Utama", arabicLabel: "اِسْمُ الفَاعِلِ", arabicWord: tasrif.isimFail.mufrod, description: "Penunjuk seseorang yang melakukan suatu gerakan.", detailObj: tasrif.isimFail, classification: "Qiyasi", variant: "indigo" },
    { title: "Isim Maful", subtitle: "Objek / Penerima", arabicLabel: "اِسْمُ المَفْعُولِ", arabicWord: tasrif.isimMaful.mufrod, description: "Penunjuk target penderita yang dikenai aktivitas.", detailObj: tasrif.isimMaful, classification: "Qiyasi", variant: "indigo" },
    { title: "Sifat Musyabihat", subtitle: "Karakter Permanen", arabicLabel: "الْصِّفَةُ الْمُشَبَّهَةُ", arabicWord: tasrif.isimMusyabihat.mufrod, description: "Pensifatan menetap menyerupai bentuk Isim Fail.", detailObj: tasrif.isimMusyabihat, classification: "Sama'i", variant: "slate" },
    { title: "Fi'il Amar", subtitle: "Kata Kerja Perintah", arabicLabel: "فِعْلُ الأَمْرِ", arabicWord: tasrif.amar, description: "Kalimat tuntutan meminta melakukan pekerjaan.", classification: "Qiyasi", variant: "rose" },
    { title: "Fi'il Nahi", subtitle: "Kata Kerja Larangan", arabicLabel: "فِعْلُ النَّهْيِ", arabicWord: tasrif.nahi, description: "Kalimat larangan pelarangan melakukan suatu hal.", classification: "Qiyasi", variant: "rose" },
    { title: "Isim Zaman", subtitle: "Nomina Waktu", arabicLabel: "اِسْمُ الزَّمَانِ", arabicWord: tasrif.isimZaman.mufrod, description: "Petunjuk waktu berlangsungnya pekerjaan.", detailObj: tasrif.isimZaman, classification: "Qiyasi", variant: "amber" },
    { title: "Isim Makan", subtitle: "Nomina Tempat", arabicLabel: "اِسْمُ المَكَانِ", arabicWord: tasrif.isimMakan.mufrod, description: "Petunjuk lokasi tempat terlaksananya gerakan.", detailObj: tasrif.isimMakan, classification: "Qiyasi", variant: "amber" },
    { title: "Isim Alat", subtitle: "Instrumen Pembantu", arabicLabel: "اِسْمُ الآلَةِ", arabicWord: tasrif.isimAlat.mufrod, description: "Penunjuk sarana alat fisik penunjang aktivitas.", detailObj: tasrif.isimAlat, classification: "Qiyasi", variant: "teal" },
    { title: "Isim Tashghir", subtitle: "Pengecilan Diminutif", arabicLabel: "اِسْمُ التَّصْغِيرِ", arabicWord: tasrif.isimTashghir, description: "Modifikasi kata untuk makna penyayangan/pengecilan.", classification: "Qiyasi", variant: "slate" },
  ];

  const getThemeColors = () => {
    if (appTheme === "light") return { bg: '#fff', cardBg: '#fff', text: '#1f2937', border: '#e5e7eb', muted: '#6b7280' };
    if (appTheme === "green") return { bg: '#021f14', cardBg: '#022e1e', text: '#d1fae5', border: '#065f46', muted: '#6ee7b7' };
    return { bg: '#031d13', cardBg: '#0f2f22', text: '#f1f5f9', border: '#1e3a2f', muted: '#94a3b8' };
  }

  const getVariantColor = (variant: string) => {
    const colors: any = {
      emerald: '#10b981', indigo: '#6366f1', rose: '#f43f5e',
      amber: '#f59e0b', teal: '#14b8a6', slate: '#64748b'
    }
    return colors[variant] || '#64748b';
  }

  const renderCard = (item: any, index: number) => {
    const customS = getCustomShorof(item.title);
    const color = getVariantColor(item.variant);
    const theme = getThemeColors();

    return (
      <View key={`istilahi-card-${index}`} style={[styles.card, { backgroundColor: theme.cardBg, borderColor: color + '40' }]}>
        <View>
          <View style={styles.cardHeader}>
            <Text style={[styles.arabicLabel, { backgroundColor: color + '25', color }]}>{item.arabicLabel}</Text>
            <Text style={[styles.classification, { backgroundColor: appTheme === "light"? '#f3f4f6' : '#1e293b', color: appTheme === "light"? '#4f46e5' : '#fbbf24' }]}>{item.classification}</Text>
          </View>
          <View style={[styles.cardTitleRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.muted }]}>{item.subtitle}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          {item.title === "Sifat Musyabihat" && tasrif.musyabihat6 && tasrif.musyabihat6.length > 0 &&!customS? (
            <View>
              <Text style={[styles.musyabihatTitle, { color }]}>6 Wazan Sifat Musyabihat:</Text>
              <View style={styles.musyabihatGrid}>
                {tasrif.musyabihat6.map((w, wIdx) => {
                  const labels = ["فَعِيلٌ", "فَعِلٌ", "فَعْلٌ", "فُعَالٌ", "فَعَالٌ", "أَفْعَلُ"];
                  return (
                    <TouchableOpacity
                      key={`musy6-${wIdx}`}
                      style={[styles.musyabihatItem, { backgroundColor: theme.bg, borderColor: theme.border }]}
                      onPress={() => copyToClipboard(w)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.arabicWord, { fontSize: 13, color: theme.text }]}>{w}</Text>
                      <View style={styles.musyabihatFooter}>
                        <Text style={[styles.wazanLabel, { color: theme.muted }]}>{labels}</Text>
                        <TouchableOpacity onPress={() => onShowWordInfo?.(w, `Sifat Musyabihat (${labels})`)}>
                          <Lock name="lock-closed" size={10} color="#d97706" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.arabicRow}>
                <TouchableOpacity onPress={() => copyToClipboard(item.arabicWord || "")}>
                  <Text style={[styles.arabicWord, { fontSize: getArabicSize(), color: theme.text }]}>{item.arabicWord || "—"}</Text>
                </TouchableOpacity>
                {item.arabicWord && item.arabicWord!== "—" && (
                  <TouchableOpacity
                    onPress={() => onShowWordInfo?.(item.arabicWord || "", item.title)}
                    style={styles.lockBtn}
                  >
                    <Lock name="lock-closed" size={10} color="#d97706" />
                  </TouchableOpacity>
                )}
              </View>
              {item.title === "Fi'il Amar" && (
                <Text style={styles.noteRed}>HURUF MUDHOROAH: DIBUANG</Text>
              )}
              {item.title === "Fi'il Nahi" && (
                <Text style={styles.noteGreen}>HURUF MUDHOROAH: ت (TAMPIL)</Text>
              )}
              <Text style={[styles.description, { color: theme.muted }]}>{item.description}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const theme = getThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ gap: 16, padding: 16 }}>
      <View style={[styles.infoBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <Info name="information-circle" size={14} color={appTheme === "light"? "#047857" : "#34d399"} />
        <Text style={[styles.infoText, { color: theme.text }]}>
          <Text style={{ fontWeight: 'bold' }}>Tasrif Istilahi (12 Shighot Klasik)</Text> adalah proses pemindahan
          akar kata menjadi bermacam struktur/shighot baik secara <Text style={{ fontWeight: 'bold', color: '#6366f1' }}>Qiyasi (terpola aturan)</Text> maupun <Text style={{ fontWeight: 'bold', color: '#f59e0b' }}>Sama'i (riwayat dengar kamus)</Text>. Tap kata arab untuk menyalin.
        </Text>
      </View>

      {layoutMode === "slide"? (
        <View style={[styles.slideContainer, { backgroundColor: theme.cardBg, borderColor: '#10b98140' }]}>
          <View style={[styles.slideHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setActiveSlideIdx((prev) => (prev > 0? prev - 1 : GRID_ITEMS.length - 1))}
              style={[styles.slideBtn, { backgroundColor: theme.bg }]}
            >
              <ChevronLeft name="chevron-back" size={20} color={theme.muted} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.slideCounter, { color: '#fbbf24' }]}>SHIGHOT {activeSlideIdx + 1} DARI {GRID_ITEMS.length}</Text>
              <Text style={[styles.slideTitle, { color: theme.text }]}>{GRID_ITEMS[activeSlideIdx].title} ({GRID_ITEMS[activeSlideIdx].subtitle})</Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveSlideIdx((prev) => (prev < GRID_ITEMS.length - 1? prev + 1 : 0))}
              style={[styles.slideBtn, { backgroundColor: theme.bg }]}
            >
              <ChevronRight name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          </View>
          <View style={{ minHeight: 190 }}>
            {renderCard(GRID_ITEMS[activeSlideIdx], activeSlideIdx)}
          </View>
          <View style={[styles.indicators, { borderTopColor: theme.border }]}>
            {GRID_ITEMS.map((_, idx) => (
              <TouchableOpacity
                key={`indicator-${idx}`}
                onPress={() => setActiveSlideIdx(idx)}
                style={[styles.indicator, { backgroundColor: theme.bg }, activeSlideIdx === idx && { backgroundColor: '#10b981' }]}
              >
                <Text style={[styles.indicatorText, { color: activeSlideIdx === idx? '#fff' : theme.muted }]}>{idx + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.grid}>
          {GRID_ITEMS.map((item, index) => renderCard(item, index))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBar: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 11, lineHeight: 16 },
  card: { padding: 14, borderRadius: 16, borderWidth: 1, minHeight: 175, justifyContent: 'space-between', width: '100%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  arabicLabel: { fontSize: 8.5, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  classification: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5, paddingHorizontal: 4, borderRadius: 4, textTransform: 'uppercase' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 4, marginBottom: 6 },
  cardTitle: { fontSize: 11, fontWeight: '800' },
  cardSubtitle: { fontSize: 8.5 },
  cardBody: { paddingVertical: 8 },
  arabicRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginBottom: 4 },
  arabicWord: { fontWeight: 'bold', writingDirection: 'rtl', textAlign: 'right', includeFontPadding: false },
  lockBtn: { padding: 4, borderRadius: 6, backgroundColor: '#fbbf241a', borderWidth: 1, borderColor: '#fbbf2440' },
  description: { fontSize: 9, marginTop: 2 },
  noteRed: { fontSize: 8, color: '#dc2626', fontWeight: '800', backgroundColor: '#fee2e250', padding: 4, borderRadius: 4, textAlign: 'center', marginVertical: 4 },
  noteGreen: { fontSize: 8, color: '#047857', fontWeight: '800', backgroundColor: '#d1fae550', padding: 4, borderRadius: 4, textAlign: 'center', marginVertical: 4 },
  musyabihatTitle: { fontSize: 8, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  musyabihatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  musyabihatItem: { width: (width - 48) / 2, padding: 4, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  musyabihatFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  wazanLabel: { fontSize: 7.5, fontFamily: 'monospace' },
  slideContainer: { padding: 20, borderRadius: 16, borderWidth: 2 },
  slideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 12, marginBottom: 12 },
  slideBtn: { padding: 8, borderRadius: 12 },
  slideCounter: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  slideTitle: { fontSize: 12, fontWeight: '900' },
  indicators: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, paddingTop: 8, borderTopWidth: 1 },
  indicator: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  indicatorActive: { backgroundColor: '#10b981' },
  indicatorText: { fontSize: 9, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }
});
