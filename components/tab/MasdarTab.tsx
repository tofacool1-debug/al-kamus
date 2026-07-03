import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors } from "@/types";

interface Props {
  entry: DictionaryEntry;
  tc: ThemeColors;
}

const BAB_MASDAR_PATTERNS: Record<number, string> = {
  1: "فَعْلٌ / فُعُولٌ / فِعَالٌ",
  2: "فَعْلٌ",
  3: "فَعْلٌ",
  4: "فُعُولٌ / فَعَلٌ",
  5: "فُعْلٌ / فَعَالَةٌ",
  6: "فِعَالٌ / فِعَالَةٌ",
};

export default function MasdarTab({ entry, tc }: Props) {
  const masdar = entry.masdar || "—";
  const masdarSamai = entry.masdarSamai;
  const hasDiff = masdarSamai && masdarSamai !== masdar;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(96,165,250,0.05)", borderWidth: 1, borderColor: "rgba(96,165,250,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="file-text" size={14} color="#60a5fa" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#60a5fa" }}>Masdar (المَصْدَر)</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            Masdar adalah bentuk infinitif / kata dasar fi'il yang menunjukkan makna perbuatan tanpa waktu.
          </Text>
        </View>
      </View>

      {/* Qiyasi */}
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 16, padding: 14, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Masdar Qiyasi (قِيَاسِي)</Text>
            <Text style={{ fontSize: 8, color: tc.textLabel, marginTop: 2 }}>Mengikuti kaidah bab {entry.babNum}</Text>
          </View>
          <View style={{ backgroundColor: "rgba(96,165,250,0.1)", borderWidth: 1, borderColor: "rgba(96,165,250,0.3)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ fontSize: 8, color: "#60a5fa", fontWeight: "900" }}>Bab {entry.babNum}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 28, fontWeight: "900", color: "#60a5fa", textAlign: "center" }}>{masdar}</Text>
        <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 8 }}>
          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 2 }}>Pola Wazan Bab {entry.babNum}:</Text>
          <Text style={{ fontSize: 10, color: tc.textLabel }}>{BAB_MASDAR_PATTERNS[entry.babNum]}</Text>
        </View>
      </View>

      {/* Sama'i */}
      {hasDiff && (
        <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: "rgba(251,191,36,0.2)", borderRadius: 16, padding: 14, gap: 8 }}>
          <View>
            <Text style={{ fontSize: 8, fontWeight: "900", color: "#fbbf24" }}>Masdar Sama'i (سَمَاعِي)</Text>
            <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2 }}>Didengar dari orang Arab, bukan ditetapkan oleh kaidah qiyasi</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#fbbf24", textAlign: "center" }}>{masdarSamai}</Text>
        </View>
      )}

      {/* Root info */}
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-around" }}>
        {[
          { label: "Fa' Fi'il", letter: entry.root.fa },
          { label: "Ain Fi'il", letter: entry.root.ain },
          { label: "Lam Fi'il", letter: entry.root.lam },
        ].map(({ label, letter }) => (
          <View key={label} style={{ alignItems: "center", gap: 2 }}>
            <Text style={{ fontSize: 8, color: tc.subText }}>{label}</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: tc.accentText }}>{letter}</Text>
          </View>
        ))}
      </View>

      {entry.notes ? (
        <View style={{ backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 10, padding: 10 }}>
          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 3 }}>Catatan:</Text>
          <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 13 }}>{entry.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
