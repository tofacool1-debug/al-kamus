import React from "react";
import { View, Text } from "react-native";
import { DictionaryEntry, ThemeColors } from "@/types";

interface Props {
  entry?: DictionaryEntry;
  data?: unknown;
  tc: ThemeColors;
}

export default function MasdarTab({ entry, data, tc }: Props) {
  const source = Array.isArray(data) ? data : data && typeof data === "object" ? (data as { entries?: DictionaryEntry[] }).entries ?? [] : [];
  const masdar = entry?.masdar || entry?.translation || "—";

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: tc.textColor }}>Masdar</Text>
      <Text style={{ fontSize: 10, color: tc.subText }}>
        {source.length > 0 ? `${source.length} item tersedia untuk ditampilkan.` : "Data masdar belum tersedia."}
      </Text>
      {entry ? (
        <Text style={{ fontSize: 16, fontWeight: "900", color: tc.accentText }}>{masdar}</Text>
      ) : null}
    </View>
  );
}