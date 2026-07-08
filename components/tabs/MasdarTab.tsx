import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Clipboard } from "react-native";
import { DictionaryEntry } from "../../types";
import { IilalEngine } from "../../utils/iilalEngine";
import { getVocalizedRoot } from "../../data/dictionary";
import { Grid, InformationCircle } from "@expo/vector-icons/Ionicons";

interface ShorofMasdarTableViewProps {
  entries: DictionaryEntry[];
  activeEntryId?: string;
  onSelectEntry?: (entry: DictionaryEntry) => void;
  isPremium?: boolean;
  onUnlock?: () => void;
  lafadzSize?: "small" | "medium" | "large" | "xlarge";
  appTheme?: "light" | "dark" | "green";
}

export default function ShorofMasdarTableView({
  entries,
  activeEntryId,
  lafadzSize = "medium",
  appTheme = "light",
}: ShorofMasdarTableViewProps) {
  const activeEntry = entries.find((e) => e.id === activeEntryId) || entries[0];

  const getThemeColors = () => {
    if (appTheme === "light") return { bg: '#fff', cardBg: '#f9fafb', text: '#111827', border: '#e5e7eb', muted: '#6b7280', accent: '#047857' };
    if (appTheme === "green") return { bg: '#021f14', cardBg: '#022e1e', text: '#d1fae5', border: '#065f46', muted: '#6ee7b7', accent: '#10b981' };
    return { bg: '#031d13', cardBg: '#0f2f22', text: '#f1f5f9', border: '#1e3a2f', muted: '#94a3b8', accent: '#34d399' };
  }
  const theme = getThemeColors();

  if (!activeEntry) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.emptyText, { color: theme.muted }]}>Tidak ada data kosa kata aktif.</Text>
      </View>
    );
  }

  const getArabicSize = () => {
    switch (lafadzSize) {
      case "small": return 14;
      case "large": return 22;
      case "xlarge": return 26;
      case "medium":
      default: return 18;
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const renderMasdarCell = (val: string | string[] | undefined) => {
    if (!val) return <Text style={[styles.emptyCell, { color: theme.muted }]}>—</Text>;

    let arr: string[] = [];
    if (Array.isArray(val)) {
      arr = val;
    } else if (typeof val === "string") {
      arr = val.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    }

    if (arr.length === 0) {
      return <Text style={[styles.emptyCell, { color: theme.muted }]}>—</Text>;
    }

    return (
      <View style={styles.masdarWrap} dir="rtl">
        {arr.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => copyToClipboard(item)}
            style={[styles.masdarTag, {
              backgroundColor: appTheme === "light"? '#ecfdf5' : '#022e1e',
              borderColor: appTheme === "light"? '#d1fae5' : '#065f46'
            }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: theme.accent }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const bina = activeEntry.bina || IilalEngine.detectBina(activeEntry.root.fa, activeEntry.root.ain, activeEntry.root.lam);

  let rawMarrah = IilalEngine.buatIsimMarrah(activeEntry.root.fa, activeEntry.root.ain, activeEntry.root.lam, bina);
  let rawNau = IilalEngine.buatIsimNau(activeEntry.root.fa, activeEntry.root.ain, activeEntry.root.lam, bina);

  const marrah = IilalEngine.postProcessWord(rawMarrah, bina, activeEntry.root.fa, activeEntry.root.ain, activeEntry.root.lam);
  const nau = IilalEngine.postProcessWord(rawNau, bina, activeEntry.root.fa, activeEntry.root.ain, activeEntry.root.lam);

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {/* Header Info */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: theme.accent + '20' }]}>
            <Grid name="grid" size={20} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Hasil Analisis Masdar</Text>
            <Text style={[styles.headerDesc, { color: theme.muted }]}>
              Menampilkan rincian variasi bentuk masdar berdasarkan kosa kata yang dipilih secara mandiri perkolom.
            </Text>
          </View>
        </View>

        {/* Selected Entry Badge */}
        <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Text style={[styles.badgeArabic, { color: '#fbbf24' }]} dir="rtl">
            {getVocalizedRoot(activeEntry.root.fa, activeEntry.root.ain, activeEntry.root.lam, activeEntry.babNum)}
          </Text>
          <View style={[styles.badgeDivider, { backgroundColor: theme.border }]}>
            <Text style={[styles.badgeTranslation, { color: theme.muted }]}>{activeEntry.translation}</Text>
            <Text style={[styles.badgeBina, { color: theme.accent }]}>BINA: {bina}</Text>
          </View>
        </View>
      </View>

      {/* 4 COLUMN GRID */}
      <View style={styles.grid}>
        {/* Column 1: Masdar Sama'i */}
        <View style={[styles.columnCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.columnLabel, { color: theme.muted }]}>1. Masdar Sama'i</Text>
            <Text style={[styles.columnLabelAr, { color: theme.muted }]}>المَصْدَر السَّمَاعِيّ</Text>
          </View>
          <View style={styles.columnContent}>
            {renderMasdarCell(activeEntry.masdarSamai)}
          </View>
        </View>

        {/* Column 2: Masdar Qiyasi */}
        <View style={[styles.columnCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.columnLabel, { color: theme.muted }]}>2. Masdar Qiyasi</Text>
            <Text style={[styles.columnLabelAr, { color: theme.muted }]}>المَصْدَر القِيَاسِيّ</Text>
          </View>
          <View style={styles.columnContent}>
            {renderMasdarCell(activeEntry.masdarQiyasi)}
          </View>
        </View>

        {/* Column 3: Masdar Marrah */}
        <View style={[styles.columnCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.columnLabel, { color: theme.muted }]}>3. Masdar Marrah</Text>
            <Text style={[styles.columnLabelAr, { color: theme.muted }]}>مَصْدَر Mَرَّة</Text>
          </View>
          <View style={styles.columnContent}>
            <TouchableOpacity
              onPress={() => copyToClipboard(marrah)}
              style={[styles.singleTag, {
                backgroundColor: appTheme === "light"? '#eff6ff' : '#1e3a8a20',
                borderColor: appTheme === "light"? '#bfdbfe' : '#1e40af40'
              }]}
            >
              <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: '#3b82f6' }]}>{marrah}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Column 4: Masdar Nau' */}
        <View style={[styles.columnCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.columnLabel, { color: theme.muted }]}>4. Masdar Nau'</Text>
            <Text style={[styles.columnLabelAr, { color: theme.muted }]}>مَصْدَر النَّوْع</Text>
          </View>
          <View style={styles.columnContent}>
            <TouchableOpacity
              onPress={() => copyToClipboard(nau)}
              style={[styles.singleTag, {
                backgroundColor: appTheme === "light"? '#faf5ff' : '#4c1d9520',
                borderColor: appTheme === "light"? '#e9d5ff' : '#7e22ce40'
              }]}
            >
              <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: '#a855f7' }]}>{nau}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notes */}
      {activeEntry.notes && (
        <View style={[styles.notesBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Text style={[styles.notesTitle, { color: '#f59e0b' }]}>Catatan Sharaf:</Text>
          <Text style={[styles.notesText, { color: theme.muted }]}>{activeEntry.notes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, padding: 20, borderRadius: 24, gap: 20 },
  emptyContainer: { paddingVertical: 32, alignItems: 'center', borderRadius: 16 },
  emptyText: { fontFamily: 'monospace', fontSize: 12 },
  header: { flexDirection: 'column', gap: 16, borderBottomWidth: 1, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBox: { padding: 10, borderRadius: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerDesc: { fontSize: 12, marginTop: 2 },
  badge: { padding: 12, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  badgeArabic: { fontSize: 20, fontWeight: '800', writingDirection: 'rtl' },
  badgeDivider: { borderLeftWidth: 1, paddingLeft: 12 },
  badgeTranslation: { fontSize: 12, fontWeight: 'bold' },
  badgeBina: { fontSize: 9, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  columnCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 16, borderWidth: 1, justifyContent: 'space-between', gap: 12 },
  columnLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  columnLabelAr: { fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
  columnContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  masdarWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  masdarTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  singleTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  arabicText: { fontWeight: '900', writingDirection: 'rtl', textAlign: 'center' },
  emptyCell: { fontFamily: 'monospace', textAlign: 'center' },
  notesBox: { padding: 16, borderRadius: 16, borderWidth: 1 },
  notesTitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  notesText: { fontSize: 12, lineHeight: 18, textAlign: 'left' }
});
