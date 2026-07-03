import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors } from "@/types";
import { getIilalExplanation } from "@/utils/iilalEngine";
import { getVocalizedRoot } from "@/utils/tasrifEngine";

interface Props {
  entry: DictionaryEntry;
  tc: ThemeColors;
}

const BINA_COLORS: Record<string, string> = {
  "Shohih": "#10b981",
  "Mitsal Wawi": "#60a5fa",
  "Mitsal Ya'i": "#60a5fa",
  "Ajwaf Wawi": "#f59e0b",
  "Ajwaf Ya'i": "#f59e0b",
  "Naqis Wawi": "#f472b6",
  "Naqis Ya'i": "#f472b6",
  "Mudha'af": "#a78bfa",
  "Lafif Maqrun": "#fb923c",
  "Lafif Mafruq": "#fb923c",
};

export default function IilalTab({ entry, tc }: Props) {
  const info = getIilalExplanation(entry);
  const color = BINA_COLORS[info.binaType] || "#94a3b8";

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="zap" size={14} color="#10b981" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#10b981" }}>Kaidah I'lal (الإِعْلَال)</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            I'lal adalah perubahan yang terjadi pada huruf illat (و ي ا) dalam proses morfologis untuk memudahkan pengucapan (takhfif).
          </Text>
        </View>
      </View>

      {/* Bina badge */}
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 14, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Bina' Terdeteksi:</Text>
          <Text style={{ fontSize: 16, fontWeight: "900", color, marginTop: 4 }}>{info.binaType}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Huruf Illat:</Text>
          <Text style={{ fontSize: 24, fontWeight: "900", color, marginTop: 2 }}>{info.hurufIllat}</Text>
        </View>
      </View>

      {info.isShahih ? (
        <View style={{ paddingVertical: 24, alignItems: "center", gap: 10 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(16,185,129,0.1)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="check" size={28} color="#10b981" />
          </View>
          <Text style={{ fontSize: 14, fontWeight: "900", color: tc.textColor }}>Aman! Bina' Shohih</Text>
          <Text style={{ fontSize: 10, color: tc.subText, textAlign: "center", lineHeight: 15, paddingHorizontal: 20 }}>
            {info.log}
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {/* Before/After transformation */}
          <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 14, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Asal Kata</Text>
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#fef3c7", marginTop: 4 }}>{info.asalKata}</Text>
            </View>
            <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
              <Feather name="arrow-right" size={16} color={color} />
              <Text style={{ fontSize: 7, color, marginTop: 2, fontWeight: "900" }}>I'LAL</Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Hasil I'lal</Text>
              <Text style={{ fontSize: 20, fontWeight: "900", color, marginTop: 4 }}>{info.hasilKata}</Text>
            </View>
          </View>

          {/* Explanation */}
          <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 6 }}>Log Transformasi I'lal:</Text>
            <Text style={{ fontSize: 10, color: tc.textColor, lineHeight: 16 }}>{info.log}</Text>
          </View>
        </View>
      )}

      {/* I'lal types reference */}
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10 }}>
        <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 6 }}>Jenis-jenis I'lal:</Text>
        {[
          { label: "I'lal bil-Qalb", desc: "Perubahan huruf illat menjadi huruf lain" },
          { label: "I'lal bil-Hadzf", desc: "Penghilangan (mahdzuf) huruf illat" },
          { label: "I'lal bis-Sukun", desc: "Huruf illat disukunkan" },
          { label: "Idgham", desc: "Dua huruf sejenis dilebur (khusus mudha'af)" },
        ].map((item) => (
          <View key={item.label} style={{ flexDirection: "row", gap: 8, marginBottom: 5 }}>
            <Text style={{ fontSize: 9, color: color, fontWeight: "900", width: 100 }}>{item.label}</Text>
            <Text style={{ fontSize: 9, color: tc.subText, flex: 1 }}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
