import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors } from "../types";
import { PRESET_DICTIONARY, searchDictionary, groupByBab, groupByBina, groupByHijaiyah } from "../data/dictionary";
import { getVocalizedRoot } from "../utils/iilalEngine";
import { dbKamus } from "../lib/db";

const BAB_LABELS: Record<number, string> = {
  1: "Fathul-Dhammi",
  2: "Fathul-Kasri",
  3: "Fathatani",
  4: "Kasrul-Fathi",
  5: "Dhammud-Dhammi",
  6: "Kasratani",
};

type GroupMode = "bab" | "bina" | "hijaiyah";

interface Props {
  selectedId: string;
  onSelectEntry: (entry: DictionaryEntry) => void;
  tc: ThemeColors;
}

export default function DictionaryPanel({ selectedId, onSelectEntry, tc }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupMode, setGroupMode] = useState<GroupMode>("bab");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(PRESET_DICTIONARY);

  useEffect(() => {
    let active = true;
    const syncAndLoad = async () => {
      try {
        const stored = await dbKamus.getAll();
        if (!stored || stored.length === 0) {
          console.log("Database empty, populating with dictionary.ts PRESET_DICTIONARY...");
          await dbKamus.bulkPut(PRESET_DICTIONARY);
          if (active) setDictionary(PRESET_DICTIONARY);
        } else if (stored.length !== PRESET_DICTIONARY.length) {
          console.log("Database count mismatched, synchronizing with dictionary.ts...");
          await dbKamus.clear();
          await dbKamus.bulkPut(PRESET_DICTIONARY);
          if (active) setDictionary(PRESET_DICTIONARY);
        } else {
          if (active) setDictionary(stored);
        }
      } catch (err) {
        console.warn("Failed to load or synchronize database kamus:", err);
        if (active) setDictionary(PRESET_DICTIONARY);
      }
    };
    syncAndLoad();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => searchDictionary(dictionary, searchQuery), [dictionary, searchQuery]);
  const byBab = useMemo(() => groupByBab(filtered), [filtered]);
  const byBina = useMemo(() => groupByBina(filtered), [filtered]);
  const byHijaiyah = useMemo(() => groupByHijaiyah(filtered), [filtered]);

  const toggleGroup = (key: string) => {
    setCollapsed((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleToggleAll = () => {
    const next = !allCollapsed;
    setAllCollapsed(next);
    const newMap: Record<string, boolean> = {};
    if (next) {
      if (groupMode === "bab") [1, 2, 3, 4, 5, 6].forEach((n) => { newMap[String(n)] = true; });
      else Object.keys(groupMode === "bina" ? byBina : byHijaiyah).forEach((k) => { newMap[k] = true; });
    }
    setCollapsed(newMap);
  };

  const renderWordBtn = (entry: DictionaryEntry) => {
    const isSel = entry.id === selectedId;
    return (
      <TouchableOpacity
        key={entry.id}
        onPress={() => onSelectEntry(entry)}
        style={{
          width: "31%",
          backgroundColor: isSel ? tc.presetBtnSelBg : tc.presetBtnNorBg,
          borderWidth: 1,
          borderColor: isSel ? tc.presetBtnSelBorder : tc.presetBtnNorBorder,
          borderRadius: 10,
          paddingVertical: 7,
          paddingHorizontal: 4,
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "900", color: isSel ? tc.presetBtnSelText : tc.presetBtnNorText, textAlign: "center" }}>
          {getVocalizedRoot(entry)}
        </Text>
        <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2, textAlign: "center" }} numberOfLines={1}>
          {entry.translation.split("/")[0].trim()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGroup = (key: string, label: React.ReactNode, labelColor: string, entries: DictionaryEntry[], sublabel?: string) => {
    if (!entries.length) return null;
    const isCollapsed = !!collapsed[key];
    return (
      <View key={key} style={{ borderWidth: 1, borderColor: tc.cardInnerBorder, backgroundColor: tc.cardInner, borderRadius: 16, padding: 8, gap: 6, marginBottom: 6 }}>
        <TouchableOpacity
          onPress={() => toggleGroup(key)}
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "900", color: labelColor }}>{label}</Text>
            {sublabel ? <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2 }}>{sublabel}</Text> : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 8, color: tc.subText }}>({entries.length})</Text>
            <Feather name={isCollapsed ? "chevron-down" : "chevron-up"} size={12} color="#94a3b8" />
          </View>
        </TouchableOpacity>
        {!isCollapsed && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(148,163,184,0.1)" }}>
            {entries.map(renderWordBtn)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: tc.card, borderWidth: 1, borderColor: tc.cardBorder, borderRadius: 20, padding: 14, gap: 10 }}>
      {/* Search */}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.inputBg, borderWidth: 1, borderColor: tc.inputBorder, borderRadius: 12, paddingHorizontal: 12 }}>
        <Feather name="search" size={14} color="#64748b" />
        <TextInput
          placeholder="Cari lafadz, makna, atau akar kata..."
          placeholderTextColor={tc.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, fontSize: 12, color: tc.inputText, paddingVertical: 9, paddingHorizontal: 8 }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Feather name="x" size={14} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Group mode selector */}
      <View style={{ flexDirection: "row", backgroundColor: tc.inputBg, borderWidth: 1, borderColor: tc.inputBorder, borderRadius: 12, padding: 2 }}>
        {(["bab", "bina", "hijaiyah"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setGroupMode(mode)}
            style={{ flex: 1, paddingVertical: 6, borderRadius: 10, backgroundColor: groupMode === mode ? tc.tabBtnActive : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontSize: 9, fontWeight: "900", color: groupMode === mode ? tc.tabBtnActiveText : tc.subText, textTransform: "uppercase" }}>
              {mode === "bab" ? "Per Bab" : mode === "bina" ? "Per Bina'" : "Hijaiyah"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toggle all */}
      <TouchableOpacity onPress={handleToggleAll} style={{ alignSelf: "flex-end" }}>
        <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981" }}>
          {allCollapsed ? "🔓 Buka Semua" : "🔒 Tutup Semua"}
        </Text>
      </TouchableOpacity>

      {/* Groups */}
      <View>
        {groupMode === "bab" && [1, 2, 3, 4, 5, 6].map((n) =>
          renderGroup(
            String(n),
            `Bab ${n} — ${BAB_LABELS[n]}`,
            tc.groupHeaderTitle,
            byBab[n] || [],
          )
        )}
        {groupMode === "bina" && Object.keys(byBina).sort().map((key) =>
          renderGroup(key, `Bina' ${key}`, "#f59e0b", byBina[key] || [])
        )}
        {groupMode === "hijaiyah" && Object.keys(byHijaiyah).sort().map((letter) =>
          renderGroup(letter, `Huruf ${letter} (${letter})`, "#f59e0b", byHijaiyah[letter] || [])
        )}
        {filtered.length === 0 && (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Feather name="search" size={24} color="#64748b" />
            <Text style={{ color: tc.subText, marginTop: 8, fontSize: 11 }}>Tidak ditemukan hasil untuk "{searchQuery}"</Text>
          </View>
        )}
      </View>
    </View>
  );
}
