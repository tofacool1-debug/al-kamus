import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors, TasrifLughowiRow } from "../../types";
import { getMadhiLughowi, getMudhariLughowi } from "../../utils/tasrifEngine";

interface Props {
  entry: DictionaryEntry;
  tc: ThemeColors;
}

export default function TasrifLughowiTab({ entry, tc }: Props) {
  const [activeConjug, setActiveConjug] = useState<"madhi" | "mudhari">("madhi");
  const madhiRows = getMadhiLughowi(entry);
  const mudhariRows = getMudhariLughowi(entry);
  const rows: TasrifLughowiRow[] = activeConjug === "madhi" ? madhiRows : mudhariRows;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="list" size={14} color="#10b981" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#10b981" }}>Tasrif Lughowi (التَّصْرِيفُ اللُّغَوِي)</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            Perubahan fi'il berdasarkan dhamir (13 kata ganti orang). Ini adalah inti tasrif klasik pesantren.
          </Text>
        </View>
      </View>

      {/* Toggle Madhi / Mudhari */}
      <View style={{ flexDirection: "row", backgroundColor: tc.inputBg, borderWidth: 1, borderColor: tc.inputBorder, borderRadius: 12, padding: 2 }}>
        {(["madhi", "mudhari"] as const).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setActiveConjug(v)}
            style={{ flex: 1, paddingVertical: 7, borderRadius: 10, backgroundColor: activeConjug === v ? tc.tabBtnActive : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontSize: 9, fontWeight: "900", color: activeConjug === v ? tc.tabBtnActiveText : tc.subText, textTransform: "uppercase" }}>
              {v === "madhi" ? "Fi'il Madhi (الماضي)" : "Fi'il Mudhari' (المضارع)"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Table */}
      <View style={{ gap: 4 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: tc.border }}>
          <Text style={{ width: 56, fontSize: 8, fontWeight: "900", color: tc.textLabel, textTransform: "uppercase" }}>Dhamir</Text>
          <Text style={{ flex: 1, fontSize: 8, fontWeight: "900", color: tc.textLabel, textTransform: "uppercase", textAlign: "center" }}>Arab</Text>
          <Text style={{ flex: 2, fontSize: 8, fontWeight: "900", color: tc.textLabel, textTransform: "uppercase", textAlign: "right" }}>Lafadz</Text>
        </View>
        {rows.map((row, i) => (
          <View
            key={i}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: i % 2 === 0 ? tc.cardInner : "transparent", borderRadius: 8, padding: 8 }}
          >
            <Text style={{ width: 56, fontSize: 9, color: tc.subText }}>{row.dhamir}</Text>
            <Text style={{ flex: 1, fontSize: 10, color: tc.textLabel, textAlign: "center" }}>{row.dhamirAr}</Text>
            <Text style={{ flex: 2, fontSize: 18, fontWeight: "900", color: activeConjug === "madhi" ? "#fbbf24" : "#34d399", textAlign: "right" }}>
              {row.form}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 10, padding: 10 }}>
        <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 2 }}>Catatan Bina':</Text>
        <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 13 }}>
          {entry.bina === "Shohih"
            ? "Kata ini bina' shohih — seluruh tasrif lughowi berlaku normal tanpa perubahan."
            : `Kata ini bina' ${entry.bina}. Beberapa bentuk tasrif lughowi mungkin mengalami perubahan (i'lal) berbeda dari tabel di atas yang bersifat perkiraan.`}
        </Text>
      </View>
    </View>
  );
}
