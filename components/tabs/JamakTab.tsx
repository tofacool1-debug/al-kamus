import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors, JamakTabType, PluralIsimFail, PluralIsimMaful, PluralIsimZamanMakan, PluralIsimAlat } from "../../types";
import { getTasrifIstilahi } from "../../utils/tasrifEngine";
import { analyzeIsimFailPlural, analyzeIsimMafulPlural, analyzeIsimZamanMakanPlural, analyzeIsimAlatPlural } from "../../utils/jamakEngine";

interface Props {
  entry: DictionaryEntry;
  tc: ThemeColors;
  isPremium: boolean;
  onUnlock: () => void;
}

const SUB_TABS: { key: JamakTabType; label: string; accent: string }[] = [
  { key: "fail",      label: "Isim Fa'il",   accent: "#a78bfa" },
  { key: "maful",     label: "Isim Maf'ul",  accent: "#f472b6" },
  { key: "zamanmakan",label: "Zaman/Makan",  accent: "#94a3b8" },
  { key: "alat",      label: "Isim Alat",    accent: "#34d399" },
];

interface RowProps {
  label: string;
  arLabel: string;
  value: string;
  accent: string;
  tc: ThemeColors;
}

function PluralRow({ label, arLabel, value, accent, tc }: RowProps) {
  const isEmpty = !value || value === "—" || value === "-" || value === "-." || value === "(—)" || value === "(-)";
  return (
    <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: tc.cardInnerBorder, borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <View style={{ flex: 0.45 }}>
        <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>{label}</Text>
        <Text style={{ fontSize: 8, color: tc.textLabel, marginTop: 1 }}>{arLabel}</Text>
      </View>
      <Text style={{ flex: 0.55, fontSize: isEmpty ? 11 : 15, fontWeight: "900", color: isEmpty ? tc.textLabel : accent, textAlign: "right", flexWrap: "wrap" }}>
        {isEmpty ? "—" : value}
      </Text>
    </View>
  );
}

function ExplanationBox({ text, tc }: { text: string; tc: ThemeColors }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n").filter(Boolean);
  const main = lines[0] || "";
  const rest = lines.slice(1).join("\n");
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(e => !e)}
      style={{ backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 10, padding: 10 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, textTransform: "uppercase" }}>Penjelasan</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={12} color="#64748b" />
      </View>
      <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 14, marginTop: 4 }}>{main}</Text>
      {expanded && rest ? (
        <Text style={{ fontSize: 9, color: tc.subText, lineHeight: 14, marginTop: 4 }}>{rest}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function JamakTab({ entry, tc, isPremium, onUnlock }: Props) {
  const [activeJamak, setActiveJamak] = useState<JamakTabType>("fail");
  const istilahi = getTasrifIstilahi(entry);

  const failData: PluralIsimFail = analyzeIsimFailPlural(entry);
  const mafulData: PluralIsimMaful = analyzeIsimMafulPlural(entry);
  const zmData: PluralIsimZamanMakan = analyzeIsimZamanMakanPlural(entry);
  const alatData: PluralIsimAlat = analyzeIsimAlatPlural(entry);

  const currentAccent = SUB_TABS.find(t => t.key === activeJamak)?.accent ?? "#94a3b8";

  const renderFailContent = () => (
    <View style={{ gap: 6 }}>
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 8, color: tc.subText }}>Mufrod (Tunggal):</Text>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#a78bfa" }}>{istilahi.isimFail}</Text>
      </View>
      <PluralRow label="Jamak Qillah" arLabel="جَمْعُ القِلَّة (3-10)" value={failData.qillah} accent="#a78bfa" tc={tc} />
      <PluralRow label="Jamak Katsroh" arLabel="جَمْعُ الكَثْرَة (>10)" value={failData.katsroh} accent="#a78bfa" tc={tc} />
      <PluralRow label="Muntahal Jumu'" arLabel="مُنْتَهَى الجُمُوع" value={failData.muntahal} accent="#a78bfa" tc={tc} />
      <ExplanationBox text={failData.explanation} tc={tc} />
    </View>
  );

  const renderMafulContent = () => (
    <View style={{ gap: 6 }}>
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: "rgba(244,114,182,0.2)", borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 8, color: tc.subText }}>Mufrod (Tunggal):</Text>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#f472b6" }}>{entry.isLazim ? "(lazim)" : istilahi.isimMaful}</Text>
      </View>
      <PluralRow label="Jamak Qillah" arLabel="جَمْعُ القِلَّة" value={mafulData.qillah} accent="#f472b6" tc={tc} />
      <PluralRow label="Jamak Katsroh" arLabel="جَمْعُ الكَثْرَة" value={mafulData.katsroh} accent="#f472b6" tc={tc} />
      <PluralRow label="Muntahal Jumu'" arLabel="مُنْتَهَى الجُمُوع" value={mafulData.muntahal} accent="#f472b6" tc={tc} />
      <ExplanationBox text={mafulData.explanation} tc={tc} />
    </View>
  );

  const renderZMContent = () => (
    <View style={{ gap: 6 }}>
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: "rgba(148,163,184,0.2)", borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 8, color: tc.subText }}>Mufrod Isim Zaman/Makan:</Text>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#94a3b8" }}>{istilahi.isimZamanMakan}</Text>
      </View>
      <PluralRow label="Jamak Qillah" arLabel="جَمْعُ القِلَّة" value={zmData.qillah} accent="#94a3b8" tc={tc} />
      <PluralRow label="Jamak Katsroh" arLabel="جَمْعُ الكَثْرَة" value={zmData.katsroh} accent="#94a3b8" tc={tc} />
      <PluralRow label="Muntahal Jumu'" arLabel="مُنْتَهَى الجُمُوع" value={zmData.muntahal} accent="#94a3b8" tc={tc} />
      <ExplanationBox text={zmData.explanation} tc={tc} />
    </View>
  );

  const renderAlatContent = () => (
    <View style={{ gap: 6 }}>
      <View style={{ backgroundColor: tc.cardInner, borderWidth: 1, borderColor: "rgba(52,211,153,0.2)", borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 8, color: tc.subText }}>Mufrod Isim Alat:</Text>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#34d399" }}>{alatData.mufrod}</Text>
      </View>
      <PluralRow label="Jamak Qillah" arLabel="جَمْعُ القِلَّة" value={alatData.qillah} accent="#34d399" tc={tc} />
      <PluralRow label="Jamak Katsroh" arLabel="جَمْعُ الكَثْرَة" value={alatData.katsroh} accent="#34d399" tc={tc} />
      <PluralRow label="Muntahal Jumu'" arLabel="مُنْتَهَى الجُمُوع" value={alatData.muntahal} accent="#34d399" tc={tc} />
      <ExplanationBox text={alatData.explanation} tc={tc} />
    </View>
  );

  return (
    <View style={{ gap: 10 }}>
      <View style={{ backgroundColor: "rgba(244,114,182,0.05)", borderWidth: 1, borderColor: "rgba(244,114,182,0.2)", padding: 10, borderRadius: 14, flexDirection: "row", gap: 8 }}>
        <Feather name="layers" size={14} color="#f472b6" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: "#f472b6" }}>Jamak Taksir (جَمْعُ التَّكْسِير)</Text>
          <Text style={{ fontSize: 9, color: tc.subText, marginTop: 3, lineHeight: 13 }}>
            Analisis jamak taksir berdasarkan bina' kata untuk Isim Fa'il, Maf'ul, Zaman/Makan, dan Isim Alat — mengikuti kaidah 7 bina ilmu sharaf.
          </Text>
        </View>
      </View>

      {/* Sub-tab selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 6 }}>
        {SUB_TABS.map(({ key, label, accent }) => {
          const isActive = activeJamak === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveJamak(key)}
              style={{
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                backgroundColor: isActive ? accent + "20" : tc.cardInner,
                borderWidth: 1,
                borderColor: isActive ? accent + "60" : tc.cardInnerBorder,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "900", color: isActive ? accent : tc.subText }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {activeJamak === "fail"       && renderFailContent()}
      {activeJamak === "maful"      && renderMafulContent()}
      {activeJamak === "zamanmakan" && renderZMContent()}
      {activeJamak === "alat"       && renderAlatContent()}

      {/* Premium nudge */}
      {!isPremium && (
        <TouchableOpacity
          onPress={onUnlock}
          style={{ backgroundColor: "rgba(251,191,36,0.05)", borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(251,191,36,0.3)", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}
        >
          <Feather name="lock" size={13} color="#fbbf24" />
          <Text style={{ fontSize: 9, fontWeight: "900", color: "#fbbf24" }}>Premium: Sanad Rujukan & Analisis Mendalam</Text>
          <Text style={{ fontSize: 8, color: tc.subText, textAlign: "center" }}>
            Aktifkan premium untuk mengakses referensi kitab kuning dan analisis I'lal per-kata.
          </Text>
        </TouchableOpacity>
      )}
      {isPremium && (
        <View style={{ backgroundColor: "rgba(245,158,11,0.05)", borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "rgba(245,158,11,0.1)" }}>
          <Text style={{ fontSize: 8, fontWeight: "900", color: "#fbbf24", marginBottom: 2 }}>📚 Rujukan:</Text>
          <Text style={{ fontSize: 8, color: tc.subText }}>Lisanul 'Arab · Kitab Sharaf Al-Kafi · Al-Shorof Al-Wadhih (v1.2)</Text>
        </View>
      )}
    </View>
  );
}
