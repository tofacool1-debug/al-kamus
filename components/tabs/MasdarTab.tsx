import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Clipboard, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { IilalEngine } from "@/utils/iilalEngine"; // pastikan path ini bener
import { getVocalizedRoot } from "@/utils/tasrifEngine";
import { DictionaryEntry } from "@/types";

interface ShorofMasdarTableViewProps {
  entries: DictionaryEntry[];
  activeEntryId?: string;
  onSelectEntry?: (entry: DictionaryEntry) => void;
  isPremium?: boolean;
  onUnlock?: () => void;
  lafadzSize?: "small" | "medium" | "large" | "xlarge";
  appTheme?: "light" | "dark" | "green";
  tc: any; // theme colors dari context kamu
}

export default function ShorofMasdarTableView({
  entries,
  activeEntryId,
  lafadzSize = "medium",
  appTheme = "light",
  tc,
}: ShorofMasdarTableViewProps) {
  const activeEntry = entries.find((e) => e.id === activeEntryId) || entries[0];

  if (!activeEntry) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: tc.subText, fontFamily: 'monospace', fontSize: 12 }}>
          Tidak ada data kosa kata aktif.
        </Text>
      </View>
    );
  }

  const getArabicFontSize = () => {
    switch (lafadzSize) {
      case "small": return 14;
      case "large": return 20;
      case "xlarge": return 24;
      case "medium":
      default: return 16;
    }
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
  };

  const renderMasdarCell = (val: string | string[] | undefined) => {
    if (!val) return <Text style={styles.emptyText}>—</Text>;

    let arr: string[] = [];
    if (Array.isArray(val)) {
      arr = val;
    } else if (typeof val === "string") {
      arr = val.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    }

    if (arr.length === 0) {
      return <Text style={styles.emptyText}>—</Text>;
    }

    return (
      <View style={styles.masdarWrap}>
        {arr.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleCopy(item)}
            style={[
              styles.masdarBadge,
              {
                backgroundColor: appTheme === "light"? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.2)",
                borderColor: appTheme === "light"? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.4)",
              }
            ]}
          >
            <Text style={[styles.masdarText, { fontSize: getArabicFontSize(), color: appTheme === "light"? "#065f46" : "#6ee7b7" }]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}