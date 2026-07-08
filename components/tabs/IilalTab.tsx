import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DictionaryEntry, ThemeColors } from "../../types";

interface Props {
  data: any;
  entry: DictionaryEntry;
  tc: ThemeColors;
}

export default function IilalTab({ data, entry, tc }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIilalExplanation = (bina: string, root: { fa: string; ain: string; lam: string }) => {
    const { fa, ain, lam } = root;
    const rules: { title: string; arabic: string; explanation: string; steps: string[] }[] = [];

    if (bina === "Ajwaf") {
      rules.push({
        title: "Qalbu (Perubahan Huruf)",
        arabic: "قَلْبُ الوَاوِ أَوِ اليَاءِ أَلِفًا",
        explanation: "Apabila huruf illat (Waw atau Ya) berharkat hidup berada di posisi 'Ain Fi'il dan didahului oleh huruf berharkat fathah, maka huruf illat tersebut diganti dengan Alif.",
        steps: [
          `Asal kata madhi adalah ${fa}َ${ain}َ${lam}َ (misal: قَوَلَ atau بَيَعَ).`,
          `Karena ${ain} hidup dan didahului fathah, maka ${ain} diganti Alif menjadi قَالَ atau بَاعَ.`,
          `Pada fi'il mudhari, harakat dipindahkan (Naql) untuk meringankan pengucapan (misal: يَقْوُلُ menjadi يَقُولُ).`
        ]
      });
    } else if (bina === "Naqis" || bina === "Lafif Maqrun" || bina === "Lafif Mafruq") {
      rules.push({
        title: "I'lal Lam Fi'il",
        arabic: "قَلْبُ اللَّامِ المُلْتَبِسَةِ أَلِفًا",
        explanation: "Apabila huruf illat berada di akhir kata (posisi Lam Fi'il) dan didahului fathah, ia diubah menjadi Alif Layyinah (ى atau ا) untuk meringankan pengucapan.",
        steps: [
          `Asal kata madhi adalah ${fa}َ${ain}َ${lam}َ (misal: دَعَوَ atau رَمَيَ).`,
          `Karena ${lam} berada di ujung kata setelah fathah, ia diganti Alif menjadi دَعَا atau رَمَى.`,
          `Saat kemasukan dhomir jamak mudzakkar, huruf illat tersebut dibuang (Hazf) untuk menghindari pertemuan dua sukun.`
        ]
      });
    } else if (bina === "Mudho'af") {
      rules.push({
        title: "Idgham (Peleburan Dua Huruf Sejenis)",
        arabic: "إِدْغَامُ المِثْلَيْنِ",
        explanation: "Apabila ada dua huruf sejenis berkumpul ('Ain Fi'il dan Lam Fi'il bernilai sama), maka huruf pertama disukunkan kemudian dimasukkan (di-tasydid) ke dalam huruf kedua.",
        steps: [
          `Asal kata madhi adalah ${fa}َ${ain}َ${lam}َ (misal: مَدَدَ).`,
          `Huruf pertama ('Ain) dimatikan harakatnya menjadi مَدْدَ.`,
          `Huruf 'Ain dilebur ke dalam Lam menggunakan tasydid sehingga menjadi مَدَّ.`
        ]
      });
    } else if (bina === "Mitsal") {
      rules.push({
        title: "Hazf (Pembuangan Huruf Waw)",
        arabic: "حَذْفُ الوَاوِ فِي المُضَارِعِ",
        explanation: "Apabila fi'il mitsal wawi (diawali Waw) berada pada bentuk mudhari aktif dengan wazan يَفْعِلُ (kasrah 'Ain), maka Waw tersebut wajib dibuang.",
        steps: [
          `Asal kata mudhari adalah يَوْ${ain}ِ${lam}ُ (misal: يَوْعِدُ).`,
          `Waw berada di antara fathah (huruf mudhoro'ah) dan kasrah ('Ain fi'il), yang mana memberatkan pengucapan.`,
          `Waw dibuang sehingga menjadi يَعِدُ.`
        ]
      });
    } else if (bina.startsWith("Mahmuz")) {
      rules.push({
        title: "Tash-hil & Ibdal Hamzah",
        arabic: "تَسْهِيلُ الهَمْزَةِ",
        explanation: "Perubahan hamzah mati yang berurutan atau terletak setelah harakat tertentu untuk mempermudah pelafalan.",
        steps: [
          `Hamzah sukun setelah dhommah diganti Waw (أُأْ -> أُو).`,
          `Hamzah sukun setelah kasrah diganti Ya (إِأْ -> إِي).`,
          `Hamzah sukun setelah fathah diganti Alif (أَأْ -> آ).`
        ]
      });
    } else {
      rules.push({
        title: "Shohih Salim",
        arabic: "السَّلَامَةُ مِنَ التَّغْيِيرِ",
        explanation: "Fi'il shohih salim adalah fi'il yang huruf-huruf aslinya bersih dari huruf illat, hamzah, maupun tadh'if (pengulangan huruf sejenis). Oleh karena itu, fi'il ini sehat dan bebas dari hukum i'lal.",
        steps: [
          "Tidak ada huruf lemah (Waw, Ya, Alif) pada kata dasar.",
          "Semua huruf diucapkan sesuai harakat asli tanpa ada pemindahan, peleburan, atau pembuangan.",
          "Merupakan dasar bentuk tasrif standar di dalam ilmu shorof."
        ]
      });
    }

    return rules;
  };

  const rulesList = getIilalExplanation(entry.bina, entry.root);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.infoBanner, { backgroundColor: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.2)" }]}>
        <Feather name="zap" size={16} color="#10b981" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: "#10b981" }]}>Kajian Kaidah I'lal ({entry.bina})</Text>
          <Text style={[styles.bannerDesc, { color: tc.subText }]}>
            Ilmu I'lal membahas perubahan huruf penyakit (Waw, Alif, Ya) agar kata bahasa Arab menjadi ringan diucapkan dan indah didengar.
          </Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 10 }}>
        {rulesList.map((rule, idx) => {
          const ruleId = `rule_${idx}`;
          const isExpanded = !!expanded[ruleId];
          return (
            <View key={idx} style={[styles.ruleCard, { backgroundColor: tc.cardInner, borderColor: tc.cardInnerBorder }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(ruleId)}
                style={styles.ruleHeader}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.ruleTitle, { color: tc.textColor }]}>{rule.title}</Text>
                  <Text style={styles.ruleArabic}>{rule.arabic}</Text>
                </View>
                <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={tc.subText} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={[styles.ruleBody, { borderTopColor: tc.border }]}>
                  <Text style={[styles.ruleExplanation, { color: tc.subText }]}>{rule.explanation}</Text>
                  
                  <View style={styles.stepsContainer}>
                    <Text style={[styles.stepsHeader, { color: tc.textColor }]}>Langkah-langkah I'lal:</Text>
                    {rule.steps.map((step, sIdx) => (
                      <View key={sIdx} style={styles.stepRow}>
                        <View style={styles.stepNumberContainer}>
                          <Text style={styles.stepNumber}>{sIdx + 1}</Text>
                        </View>
                        <Text style={[styles.stepText, { color: tc.subText }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  infoBanner: { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  bannerTitle: { fontSize: 11, fontWeight: "900" },
  bannerDesc: { fontSize: 9, marginTop: 3, lineHeight: 13 },
  ruleCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  ruleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  ruleTitle: { fontSize: 11, fontWeight: "800" },
  ruleArabic: { fontSize: 16, fontWeight: "900", color: "#10b981", marginTop: 4, writingDirection: "rtl" },
  ruleBody: { borderTopWidth: 1, padding: 14, gap: 10 },
  ruleExplanation: { fontSize: 10, lineHeight: 15 },
  stepsContainer: { gap: 8, marginTop: 4 },
  stepsHeader: { fontSize: 9, fontWeight: "900" },
  stepRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  stepNumberContainer: { backgroundColor: "rgba(16,185,129,0.1)", width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 2 },
  stepNumber: { fontSize: 8, fontWeight: "900", color: "#10b981" },
  stepText: { flex: 1, fontSize: 9, lineHeight: 14 }
});
