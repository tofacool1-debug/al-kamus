import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Clipboard } from "react-native";
import { TasrifIstilahi, TasrifLughowi } from "../../types";
import { IilalEngine } from "../../utils/iilalEngine";
import { PRONOUNS_14, PRONOUNS_12, PRONOUNS_ISIM_6 } from "../../data/dictionary";
import {
  Info, Copy, LockClosed, Sparkles, Book, Pulse, Ribbon,
  Person, PersonAdd, Time, Location, Hammer, ChevronForward
} from "@expo/vector-icons/Ionicons";

interface TasrifLughowiViewProps {
  tasrif: TasrifIstilahi;
  fa: string;
  ain: string;
  lam: string;
  bina: string;
  babNum: number;
  isPremium?: boolean;
  onUnlock?: () => void;
  onShowWordInfo?: (word: string, shighot: string) => void;
  lafadzSize?: "small" | "medium" | "large" | "xlarge";
  appTheme?: "dark" | "light" | "green";
}

type SubTabType =
  | "madhi"
  | "mudhari"
  | "amar_nahi"
  | "isim_fail"
  | "isim_maful"
  | "isim_zaman"
  | "isim_makan"
  | "isim_alat"
  | "sifat_musyabihat";

export default function TasrifLughowiView({
  tasrif,
  fa,
  ain,
  lam,
  bina,
  babNum,
  isPremium = false,
  onUnlock,
  onShowWordInfo,
  lafadzSize = "medium",
  appTheme = "dark",
}: TasrifLughowiViewProps) {
  const [subTab, setSubTab] = useState<SubTabType>("madhi");
  const [selectedMusyabihatIdx, setSelectedMusyabihatIdx] = useState(0);
  const [isFiilOpen, setIsFiilOpen] = useState(true);
  const [isIsimOpen, setIsimOpen] = useState(true);
  const [isAlatOpen, setIsAlatOpen] = useState(true);

  const getThemeColors = () => {
    if (appTheme === "light") return { bg: '#fff', cardBg: '#fff', text: '#1f2937', border: '#e5e7eb', muted: '#6b7280' };
    if (appTheme === "green") return { bg: '#021f14', cardBg: '#022e1e', text: '#d1fae5', border: '#065f46', muted: '#6ee7b7' };
    return { bg: '#031d13', cardBg: '#0f2f22', text: '#f1f5f9', border: '#1e3a2f', muted: '#94a3b8' };
  }
  const theme = getThemeColors();

  const getArabicSize = () => {
    switch (lafadzSize) {
      case "small": return 14;
      case "large": return 23;
      case "xlarge": return 30;
      default: return 18;
    }
  };

  const lughowi: TasrifLughowi = useMemo(() =>
    IilalEngine.tasrifLughowi(tasrif, fa, ain, lam, bina, babNum),
  [tasrif, fa, ain, lam, bina, babNum]);

  const conjugateNoun6 = (bentukMufrod: string): string[] => {
    if (!bentukMufrod || bentukMufrod === "—") return Array(6).fill("—");
    const FATHA = "َ";
    const DAMMA = "ُ";
    const base = bentukMufrod.replace(/[ًٌٍ]$/, "");
    return [
      bentukMufrod,
      base + FATHA + "انِ",
      base + DAMMA + "ونَ",
      base + FATHA + "ةٌ",
      base + FATHA + "تَانِ",
      base + FATHA + "اتٌ",
    ];
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const renderNounCardList = (title: string, values: string[], shighotName: string) => {
    return (
      <View style={[styles.cardContainer, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
        <View style={styles.grid}>
          {PRONOUNS_ISIM_6.map((pron, idx) => {
            const val = values[idx] || "—";
            return (
              <View key={`${shighotName}-${idx}`} style={[styles.nounItem, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <Text style={[styles.arabicText, { fontSize: 15, color: theme.text }]}>{pron.arabic}</Text>
                    <Text style={[styles.translit, { color: theme.muted }]}>({pron.translit})</Text>
                  </View>
                  <Text style={[styles.desc, { color: theme.muted }]}>{pron.desc}</Text>
                </View>
                <View style={styles.actions}>
                  <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: theme.text }]}>{val}</Text>
                  {val!== "—" && (
                    <TouchableOpacity onPress={() => onShowWordInfo?.(val, `${shighotName} (${pron.arabic})`)}>
                      <LockClosed size={12} color="#d97706" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => copyToClipboard(val)}>
                    <Copy size={14} color={theme.muted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const TabButton = ({ item, active, onPress, color }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, { backgroundColor: theme.bg, borderColor: active? color : theme.border }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: color + '25' }]}>
          <item.icon size={16} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tabTitle, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.tabDesc, { color: theme.muted }]}>{item.desc}</Text>
        </View>
      </View>
      <Text style={[styles.arabicText, { color: color }]}>{item.arabic}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* GROUP TABS */}
      <View style={styles.grid3}>
        {/* VERBA */}
        <View style={[styles.groupBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <TouchableOpacity onPress={() => setIsFiilOpen(!isFiilOpen)} style={[styles.groupHeader, { borderBottomColor: theme.border }]}>
            <ChevronForward size={16} color="#10b981" style={{ transform: [{ rotate: isFiilOpen? '90deg' : '0deg' }] }} />
            <Text style={[styles.groupTitle, { color: theme.muted }]}>Verba (Kata Kerja)</Text>
            <Text style={[styles.arabicText, { color: '#10b981' }]}>الأفعال</Text>
          </TouchableOpacity>
          {isFiilOpen && (
            <>
              <TabButton item={{ id: "madhi", name: "Fi'il Madhi", desc: "Masa Lampau (14 Dhomir)", arabic: "الماضي", icon: Book }} active={subTab === "madhi"} onPress={() => setSubTab("madhi")} color="#10b981" />
              <TabButton item={{ id: "mudhari", name: "Fi'il Mudhari", desc: "Masa Kini/Nanti (14 Dhomir)", arabic: "المضارع", icon: Pulse }} active={subTab === "mudhari"} onPress={() => setSubTab("mudhari")} color="#10b981" />
              <TabButton item={{ id: "amar_nahi", name: "Amar & Nahi", desc: "Perintah & Larangan (12 D)", arabic: "الأمر والنهي", icon: Ribbon }} active={subTab === "amar_nahi"} onPress={() => setSubTab("amar_nahi")} color="#10b981" />
            </>
          )}
        </View>

        {/* ISIM */}
        <View style={[styles.groupBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <TouchableOpacity onPress={() => setIsimOpen(!isIsimOpen)} style={[styles.groupHeader, { borderBottomColor: theme.border }]}>
            <ChevronForward size={16} color="#6366f1" style={{ transform: [{ rotate: isIsimOpen? '90deg' : '0deg' }] }} />
            <Text style={[styles.groupTitle, { color: theme.muted }]}>Isim Pelaku & Sifat</Text>
            <Text style={[styles.arabicText, { color: '#6366f1' }]}>الأسماء المشتقة</Text>
          </TouchableOpacity>
          {isIsimOpen && (
            <>
              <TabButton item={{ id: "isim_fail", name: "Isim Fail", desc: "Subjek / Pelaku (6 Suffix)", arabic: "اسم الفاعل", icon: Person }} active={subTab === "isim_fail"} onPress={() => setSubTab("isim_fail")} color="#6366f1" />
              <TabButton item={{ id: "isim_maful", name: "Isim Maful", desc: "Penderita / Objek (6 Suffix)", arabic: "اسم المفعول", icon: PersonAdd }} active={subTab === "isim_maful"} onPress={() => setSubTab("isim_maful")} color="#6366f1" />
              <TabButton item={{ id: "sifat_musyabihat", name: "Sifat Musyabihat", desc: "Karakter tetap (6 Suffix)", arabic: "الصفة المشبهة", icon: Sparkles }} active={subTab === "sifat_musyabihat"} onPress={() => setSubTab("sifat_musyabihat")} color="#6366f1" />
            </>
          )}
        </View>

        {/* ALAT */}
        <View style={[styles.groupBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <TouchableOpacity onPress={() => setIsAlatOpen(!isAlatOpen)} style={[styles.groupHeader, { borderBottomColor: theme.border }]}>
            <ChevronForward size={16} color="#f59e0b" style={{ transform: [{ rotate: isAlatOpen? '90deg' : '0deg' }] }} />
            <Text style={[styles.groupTitle, { color: theme.muted }]}>Kondisi & Alat</Text>
            <Text style={[styles.arabicText, { color: '#f59e0b' }]}>الظروف والآلة</Text>
          </TouchableOpacity>
          {isAlatOpen && (
            <>
              <TabButton item={{ id: "isim_zaman", name: "Isim Zaman", desc: "Keterangan Waktu (6 Suffix)", arabic: "اسم الزمان", icon: Time }} active={subTab === "isim_zaman"} onPress={() => setSubTab("isim_zaman")} color="#f59e0b" />
              <TabButton item={{ id: "isim_makan", name: "Isim Makan", desc: "Keterangan Tempat (6 Suffix)", arabic: "اسم المكان", icon: Location }} active={subTab === "isim_makan"} onPress={() => setSubTab("isim_makan")} color="#f59e0b" />
              <TabButton item={{ id: "isim_alat", name: "Isim Alat", desc: "Perkakas / Instrumen (6 Suf)", arabic: "اسم الآلة", icon: Hammer }} active={subTab === "isim_alat"} onPress={() => setSubTab("isim_alat")} color="#f59e0b" />
            </>
          )}
        </View>
      </View>

      {/* CONTENT */}
      <View style={[styles.contentBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {/* MADHI */}
        {subTab === "madhi" && (
          <ScrollView>
            {PRONOUNS_14.map((pronoun, index) => {
              const val = lughowi.madhi14[index] || "—";
              return (
                <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                  <Text style={{ color: theme.muted }}>{index + 1}</Text>
                  <Text style={[styles.arabicText, { color: theme.text }]}>{pronoun.arabic}</Text>
                  <Text style={{ color: theme.muted, flex: 1 }}>{pronoun.desc}</Text>
                  <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: theme.text }]}>{val}</Text>
                  <View style={styles.row}>
                    {val!== "—" && <TouchableOpacity onPress={() => onShowWordInfo?.(val, `Fi'il Madhi (${pronoun.arabic})`)}><LockClosed size={12} color="#d97706" /></TouchableOpacity>}
                    <TouchableOpacity onPress={() => copyToClipboard(val)}><Copy size={14} color={theme.muted} /></TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}

        {/* MUDHARI */}
        {subTab === "mudhari" && (
          <ScrollView>
            {PRONOUNS_14.map((pronoun, index) => {
              const val = lughowi.mudhari14[index] || "—";
              return (
                <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                  <Text style={{ color: theme.muted }}>{index + 1}</Text>
                  <Text style={[styles.arabicText, { color: theme.text }]}>{pronoun.arabic}</Text>
                  <Text style={{ color: theme.muted, flex: 1 }}>{pronoun.desc}</Text>
                  <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: theme.text }]}>{val}</Text>
                  <View style={styles.row}>
                    {val!== "—" && <TouchableOpacity onPress={() => onShowWordInfo?.(val, `Fi'il Mudhari (${pronoun.arabic})`)}><LockClosed size={12} color="#d97706" /></TouchableOpacity>}
                    <TouchableOpacity onPress={() => copyToClipboard(val)}><Copy size={14} color={theme.muted} /></TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}

        {/* AMAR NAHI */}
        {subTab === "amar_nahi" && (
          <View style={styles.splitContainer}>
            <View style={{ flex: 1 }}>
              <View style={styles.subHeader}>
                <Text style={[styles.subHeaderTitle, { backgroundColor: '#fee2e2', color: '#be123c' }]}>Fi'il Amar (12 Dhomir)</Text>
                <Text style={[styles.subHeaderNote, { backgroundColor: '#fee2e2', color: '#be123c' }]}>Huruf Mudhoroah: DIBUANG</Text>
              </View>
              <ScrollView>
                {PRONOUNS_12.map((pronoun, index) => {
                  const val = lughowi.amar12[index] || "—";
                  return (
                    <View key={index} style={[styles.nounItem, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                      <View>
                        <Text style={[styles.arabicText, { color: theme.text }]}>{pronoun.arabic}</Text>
                        <Text style={[styles.desc, { color: theme.muted }]}>{pronoun.desc}</Text>
                      </View>
                      <View style={styles.actions}>
                        <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: theme.text }]}>{val}</Text>
                        {val!== "—" && <TouchableOpacity onPress={() => onShowWordInfo?.(val, `Fi'il Amar (${pronoun.arabic})`)}><LockClosed size={12} color="#d97706" /></TouchableOpacity>}
                        <TouchableOpacity onPress={() => copyToClipboard(val)}><Copy size={14} color={theme.muted} /></TouchableOpacity>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.subHeader}>
                <Text style={[styles.subHeaderTitle, { backgroundColor: '#d1fae5', color: '#065f46' }]}>Fi'il Nahi (12 Dhomir)</Text>
                <Text style={[styles.subHeaderNote, { backgroundColor: '#d1fae5', color: '#065f46' }]}>Huruf Mudhoroah: ت</Text>
              </View>
              <ScrollView>
                {PRONOUNS_12.map((pronoun, index) => {
                  const val = lughowi.nahi12[index] || "—";
                  return (
                    <View key={index} style={[styles.nounItem, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                      <View>
                        <Text style={[styles.arabicText, { color: theme.text }]}>{pronoun.arabic}</Text>
                        <Text style={[styles.desc, { color: theme.muted }]}>{pronoun.desc}</Text>
                      </View>
                      <View style={styles.actions}>
                        <Text style={[styles.arabicText, { fontSize: getArabicSize(), color: theme.text }]}>{val}</Text>
                        {val!== "—" && <TouchableOpacity onPress={() => onShowWordInfo?.(val, `Fi'il Nahi (${pronoun.arabic})`)}><LockClosed size={12} color="#d97706" /></TouchableOpacity>}
                        <TouchableOpacity onPress={() => copyToClipboard(val)}><Copy size={14} color={theme.muted} /></TouchableOpacity>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ISIM CARDS */}
        {subTab === "isim_fail" && renderNounCardList("Isim Fail (Pelaku)", lughowi.isimFail6, "Isim Fail")}
        {subTab === "isim_maful" && renderNounCardList("Isim Maful (Penderita)", lughowi.isimMaful6, "Isim Maful")}
        {subTab === "isim_zaman" && renderNounCardList("Isim Zaman (Waktu)", lughowi.isimZaman6, "Isim Zaman")}
        {subTab === "isim_makan" && renderNounCardList("Isim Makan (Tempat)", lughowi.isimMakan6, "Isim Makan")}
        {subTab === "isim_alat" && renderNounCardList("Isim Alat (Perkakas)", lughowi.isimAlat6, "Isim Alat")}

        {/* SIFAT MUSYABIHAT */}
        {subTab === "sifat_musyabihat" && (
          <View style={[styles.cardContainer, { backgroundColor: theme.cardBg }]}>
            <View style={styles.wazanSelector}>
              {(tasrif.musyabihat6 || [tasrif.isimMusyabihat.mufrod]).map((w, index) => {
                const labels = ["فَعِيلٌ", "فَعِلٌ", "فَعْلٌ", "فُعَالٌ", "فَعَالٌ", "أَفْعَلُ"];
                const isSelected = selectedMusyabihatIdx === index;
                return (
                  <TouchableOpacity key={index} onPress={() => setSelectedMusyabihatIdx(index)} style={[styles.wazanBtn, { backgroundColor: isSelected? '#6366f1' : theme.bg, borderColor: isSelected? '#6366f1' : theme.border }]}>
                    <Text style={[styles.arabicText, { color: isSelected? '#fff' : theme.text }]}>{w}</Text>
                    <Text style={{ fontSize: 8, color: isSelected? '#c7d2fe' : theme.muted }}>{labels[index]}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            {renderNounCardList("Tasrif Lughowi Sifat Musyabihat", conjugateNoun6(tasrif.musyabihat6?.[selectedMusyabihatIdx] || tasrif.isimMusyabihat.mufrod), "Sifat Musyabihat")}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  grid3: { flexDirection: 'column', gap: 16 },
  groupBox: { padding: 16, borderRadius: 16, borderWidth: 1 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderBottomWidth: 1, borderStyle: 'dashed', paddingBottom: 8 },
  groupTitle: { flex: 1, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  tabBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 8, justifyContent: 'space-between' },
  iconBox: { padding: 6, borderRadius: 8, marginRight: 10 },
  tabTitle: { fontSize: 12, fontWeight: 'bold' },
  tabDesc: { fontSize: 9 },
  contentBox: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginTop: 16 },
  cardContainer: { padding: 16 },
  cardTitle: { fontWeight: 'bold', fontSize: 12, marginBottom: 16 },
  grid: { gap: 12 },
  nounItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  arabicText: { fontWeight: 'bold', writingDirection: 'rtl' },
  translit: { fontSize: 10 },
  desc: { fontSize: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tableRow: { flexDirection: 'row', padding: 10, gap: 8, borderBottomWidth: 1, alignItems: 'center' },
  splitContainer: { flexDirection: 'row', gap: 8 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, borderRadius: 8, marginBottom: 8 },
  subHeaderTitle: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  subHeaderNote: { fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  wazanSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  wazanBtn: { padding: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' }
});
