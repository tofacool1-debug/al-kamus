import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors } from "@/types";
import { analyzeSifatMusyabihatPlural } from "@/utils/sifatEngine";
import { getTasrifIstilahi } from "@/utils/tasrifEngine";

interface Props {
  entry: DictionaryEntry;
  tc: ThemeColors;
  isPremium: boolean;
  onUnlock: () => void;
}

const ALL_WAZANS = [
  { wazan: "فَعِيلٌ", example: "كَرِيمٌ", meaning: "Sifat menetap (كرم)" },
  { wazan: "فَعَلٌ",  example: "حَسَنٌ",  meaning: "Bawaan fisik/moral (حسن)" },
  { wazan: "فَعِلٌ",  example: "فَرِحٌ",  meaning: "Emosi sesaat (فرح)" },
  { wazan: "فَعْلَانُ", example: "عَطْشَانُ", meaning: "Kondisi sementara (عطش)" },
  { wazan: "أَفْعَلُ", example: "أَحْمَرُ", meaning: "Warna / cacat (حمر)" },
  { wazan: "فَعَالٌ",  example: "جَبَانٌ",  meaning: "Sifat hiperbolis (جبن)" },
  { wazan: "فَعُولٌ",  example: "صَبُورٌ",  meaning: "Sabar / tekun (صبر)" },
];

function InfoRow({ label, value, accent, tc }: { label: string; value: string; accent: string; tc: ThemeColors }) {
  const isEmpty = !value || value === "—" || value === "-" || value === "-.";
  return (
    <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, flex: 0.4 }}>{label}</Text>
      <Text style={{ fontSize: isEmpty ? 11 : 16, fontWeight: "900", color: isEmpty ? tc.textLabel : accent, flex: 0.6, textAlign: "right", flexWrap: "wrap" }}>
        {isEmpty ? "—" : value}
      </Text>
    </View>
  );
}

export default function SifatTab({ entry, tc, isPremium, onUnlock }: Props) {
  const [showExplanation, setShowExplanation] = useState(false);
  const hasRawSifat = !!(entry.sifatMusyabihat && entry.sifatMusyabihat !== "—");
  const istilahi = getTasrifIstilahi(entry);
  const plural = analyzeSifatMusyabihatPlural(entry);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(167,139,250,0.05)", borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="star" size={14} color="#a78bfa" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#a78bfa" }}>Sifat Musyabihat (الصِّفَةُ المُشَبَّهَة)</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            Isim sifat yang menyerupai Isim Fa'il namun menunjukkan sifat permanen (tabiat bawaan), berbeda dari sifat sementara Isim Fa'il.
          </Text>
        </View>
      </View>

      {hasRawSifat ? (
        <View style={{ gap: 8 }}>
          {/* Isim Fa'il vs Sifat comparison */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1, alignItems: "center", backgroundColor: "rgba(251,191,36,0.05)", borderWidth: 1, borderColor: "rgba(251,191,36,0.15)", borderRadius: 12, padding: 10 }}>
              <Text style={{ fontSize: 8, color: tc.subText }}>Isim Fa'il</Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#fbbf24", marginTop: 4 }}>{istilahi.isimFail}</Text>
              <Text style={{ fontSize: 7, color: tc.subText, marginTop: 3, textAlign: "center" }}>Sementara</Text>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
              <Feather name="arrow-right" size={14} color="#64748b" />
            </View>
            <View style={{ flex: 1, alignItems: "center", backgroundColor: "rgba(167,139,250,0.05)", borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", borderRadius: 12, padding: 10 }}>
              <Text style={{ fontSize: 8, color: tc.subText }}>Sifat Musyabihat</Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#a78bfa", marginTop: 4 }}>{entry.sifatMusyabihat}</Text>
              <Text style={{ fontSize: 7, color: tc.subText, marginTop: 3, textAlign: "center" }}>Permanen</Text>
            </View>
          </View>

          {/* Wazan badge */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <View style={{ backgroundColor: "rgba(167,139,250,0.1)", borderWidth: 1, borderColor: "rgba(167,139,250,0.25)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ fontSize: 9, fontWeight: "900", color: "#a78bfa" }}>Wazan: {plural.wazan_name}</Text>
            </View>
            <View style={{ backgroundColor: plural.isQiyasi ? "rgba(16,185,129,0.1)" : "rgba(251,191,36,0.1)", borderWidth: 1, borderColor: plural.isQiyasi ? "rgba(16,185,129,0.2)" : "rgba(251,191,36,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ fontSize: 8, fontWeight: "900", color: plural.isQiyasi ? "#10b981" : "#fbbf24" }}>
                {plural.isQiyasi ? "Qiyasi" : "Sama'i"}
              </Text>
            </View>
          </View>

          {/* Mufrod & Plural forms */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontWeight: "900", color: tc.subText, textTransform: "uppercase" }}>Mufrod (Tunggal)</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={{ flex: 1, alignItems: "center", backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10 }}>
                <Text style={{ fontSize: 7, color: tc.subText }}>Mudzakkar (L)</Text>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#a78bfa", marginTop: 4 }}>{plural.mufrod_mudzakkar || entry.sifatMusyabihat}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center", backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10 }}>
                <Text style={{ fontSize: 7, color: tc.subText }}>Muannats (P)</Text>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#f472b6", marginTop: 4 }}>{plural.mufrod_muannas === "—" ? "(sama)" : (plural.mufrod_muannas || "—")}</Text>
              </View>
            </View>

            <Text style={{ fontSize: 9, fontWeight: "900", color: tc.subText, textTransform: "uppercase", marginTop: 4 }}>Jamak Taksir</Text>
            <InfoRow label="Jamak Katsroh" value={plural.katsroh} accent="#a78bfa" tc={tc} />
            <InfoRow label="Muntahal Jumu'" value={plural.muntahal} accent="#a78bfa" tc={tc} />
          </View>

          {/* Explanation collapsible */}
          {plural.explanation ? (
            <TouchableOpacity
              onPress={() => setShowExplanation(e => !e)}
              style={{ backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 10, padding: 10 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, textTransform: "uppercase" }}>Penjelasan Wazan</Text>
                <Feather name={showExplanation ? "chevron-up" : "chevron-down"} size={12} color="#64748b" />
              </View>
              {showExplanation && (
                <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 14, marginTop: 6 }}>{plural.explanation}</Text>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Premium nudge */}
          {!isPremium && (
            <TouchableOpacity
              onPress={onUnlock}
              style={{ backgroundColor: "rgba(251,191,36,0.05)", borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(251,191,36,0.3)", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}
            >
              <Feather name="lock" size={13} color="#fbbf24" />
              <Text style={{ fontSize: 9, fontWeight: "900", color: "#fbbf24" }}>Premium: Analisis Jamak Mendalam</Text>
              <Text style={{ fontSize: 8, color: tc.subText, textAlign: "center" }}>Aktifkan premium untuk sanad rujukan dan kaidah I'lal per bina'.</Text>
            </TouchableOpacity>
          )}

          {isPremium && (
            <View style={{ backgroundColor: "rgba(245,158,11,0.05)", borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "rgba(245,158,11,0.1)" }}>
              <Text style={{ fontSize: 8, fontWeight: "900", color: "#fbbf24", marginBottom: 2 }}>📚 Rujukan:</Text>
              <Text style={{ fontSize: 8, color: tc.subText }}>{plural.reference}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <View style={{ paddingVertical: 20, alignItems: "center", gap: 8 }}>
            <Feather name="info" size={24} color="#64748b" />
            <Text style={{ fontSize: 12, fontWeight: "900", color: tc.textColor }}>Tidak Ada Sifat Musyabihat</Text>
            <Text style={{ fontSize: 10, color: tc.subText, textAlign: "center", lineHeight: 15, paddingHorizontal: 16 }}>
              Kata ini tidak memiliki Sifat Musyabihat yang lazim digunakan. Sifat Musyabihat umumnya dimiliki fi'il lazim bab 4 dan bab 5.
            </Text>
          </View>

          <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10 }}>
            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 8 }}>7 Wazan Sifat Musyabihat yang Dikenal:</Text>
            <View style={{ gap: 6 }}>
              {ALL_WAZANS.map((s) => (
                <View key={s.wazan} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#a78bfa", width: 70, textAlign: "right" }}>{s.wazan}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#fbbf24", width: 65, textAlign: "center" }}>{s.example}</Text>
                  <Text style={{ fontSize: 8, color: tc.subText, flex: 1 }}>{s.meaning}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
