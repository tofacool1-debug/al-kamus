import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors } from "@/types";

interface Props {
  entry?: DictionaryEntry;
  data?: unknown;
  tc: ThemeColors;
  isPremium?: boolean;
  onUnlock?: () => void;
}

export default function SifatTab({ entry, tc, isPremium = false, onUnlock }: Props) {
  const sifat = entry?.sifatMusyabihat || "—";

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(167,139,250,0.05)", borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="star" size={14} color="#a78bfa" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#a78bfa" }}>Sifat Musyabihat</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            Informasi sifat musyabihat akan muncul saat data kata tersedia.
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: "900", color: tc.textColor }}>Sifat</Text>
        <Text style={{ fontSize: 16, fontWeight: "900", color: tc.accentText }}>{sifat}</Text>
      </View>

      {!isPremium && onUnlock ? (
        <TouchableOpacity
          onPress={onUnlock}
          style={{ backgroundColor: "rgba(251,191,36,0.05)", borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(251,191,36,0.3)", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}
        >
          <Feather name="lock" size={13} color="#fbbf24" />
          <Text style={{ fontSize: 9, fontWeight: "900", color: "#fbbf24" }}>Premium: Analisis Mendalam</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
