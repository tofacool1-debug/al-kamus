import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors, TasrifIstilahiData } from "@/types";
import { getTasrifIstilahi } from "@/utils/tasrifEngine";

interface Props {
  entry: DictionaryEntry;
  tc: ThemeColors;
}

const ROWS: { key: keyof TasrifIstilahiData; label: string; arLabel: string; accent?: string }[] = [
  { key: "madhi",         label: "Fi'il Madhi",       arLabel: "الفِعْلُ المَاضِي",    accent: "#fbbf24" },
  { key: "mudhari",       label: "Fi'il Mudhari'",     arLabel: "الفِعْلُ المُضَارِع",  accent: "#34d399" },
  { key: "masdar",        label: "Masdar",             arLabel: "المَصْدَر",            accent: "#60a5fa" },
  { key: "isimFail",      label: "Isim Fa'il",         arLabel: "اِسْمُ الفَاعِل",      accent: "#a78bfa" },
  { key: "isimMaful",     label: "Isim Maf'ul",        arLabel: "اِسْمُ المَفْعُول",    accent: "#f472b6" },
  { key: "amr",           label: "Fi'il Amr",          arLabel: "فِعْلُ الأَمْر",       accent: "#fb923c" },
  { key: "nahi",          label: "Fi'il Nahi",         arLabel: "فِعْلُ النَّهْي",      accent: "#f43f5e" },
  { key: "isimZamanMakan",label: "Isim Zaman/Makan",   arLabel: "اِسْمُ الزَّمَان/المَكَان", accent: "#94a3b8" },
];

export default function TasrifIstilahiTab({ entry, tc }: Props) {
  const data = getTasrifIstilahi(entry);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="book-open" size={14} color="#10b981" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#10b981" }}>Tasrif Istilahi (التَّصْرِيفُ الاصْطِلاحِي)</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            Perubahan bentuk fi'il berdasarkan jenis kata (7 bentuk pokok) sesuai kaidah ilmu sharaf.
          </Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        {ROWS.map(({ key, label, arLabel, accent }) => {
          const form = data[key];
          const isEmpty = !form || form === "—";
          return (
            <View key={key} style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>{label}</Text>
                <Text style={{ fontSize: 8, color: tc.textLabel, marginTop: 1, fontFamily: "monospace" }}>{arLabel}</Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: isEmpty ? tc.textLabel : (accent || tc.accentText),
                  textAlign: "right",
                  maxWidth: "58%",
                }}
              >
                {isEmpty ? "(لَازِم)" : form}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10, gap: 4 }}>
        <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Bina' Kata:</Text>
        <Text style={{ fontSize: 11, color: tc.accentText, fontWeight: "700" }}>{entry.bina}</Text>
        {entry.notes ? <Text style={{ fontSize: 9, color: tc.subText, marginTop: 4, lineHeight: 13 }}>{entry.notes}</Text> : null}
      </View>
    </View>
  );
}
