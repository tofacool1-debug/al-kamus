import { DictionaryEntry } from "@/types";

const HURUF_ILLAT = ["و", "ي", "ا"];
const HURUF_HALQ = ["ء", "ه", "ع", "ح", "غ", "خ"];

export function detectBina(fa: string, ain: string, lam: string): string {
  const isFaIllat = HURUF_ILLAT.includes(fa);
  const isAinIllat = HURUF_ILLAT.includes(ain) || ain === "ا";
  const isLamIllat = HURUF_ILLAT.includes(lam) || lam === "ى";
  const isMudha = ain === lam;

  if (isFaIllat && isLamIllat) return "Lafif Mafruq";
  if (isAinIllat && isLamIllat) return "Lafif Maqrun";
  if (isMudha) return "Mudha'af";
  if (isFaIllat) return fa === "و" ? "Mitsal Wawi" : "Mitsal Ya'i";
  if (isAinIllat) return (ain === "و" || ain === "ا") ? "Ajwaf Wawi" : "Ajwaf Ya'i";
  if (isLamIllat) return (lam === "و") ? "Naqis Wawi" : "Naqis Ya'i";
  return "Shohih";
}

export function hasHurufHalqAinLam(ain: string, lam: string): boolean {
  return HURUF_HALQ.includes(ain) || HURUF_HALQ.includes(lam);
}

export function isShahih(entry: DictionaryEntry): boolean {
  return entry.bina === "Shohih";
}

export function getIilalExplanation(entry: DictionaryEntry): {
  isShahih: boolean;
  binaType: string;
  asalKata: string;
  hasilKata: string;
  log: string;
  hurufIllat: string;
} {
  const { fa, ain, lam } = entry.root;
  const shahih = entry.bina === "Shohih";
  const asalKata = entry.asal || entry.madhi || getDefaultAsal(fa, ain, lam, entry.babNum);
  const hasilKata = entry.madhi || asalKata;

  if (shahih) {
    return {
      isShahih: true,
      binaType: "Shohih",
      asalKata,
      hasilKata,
      log: "Kata ini tersusun dari huruf murni tanpa huruf illat (و ي ا). Tidak membutuhkan i'lal. Semua bentuk tasrif berjalan normal sesuai kaidah standar.",
      hurufIllat: "—",
    };
  }

  let huruf = "—";
  let log = entry.explanation || getBinaExplanation(entry.bina, fa, ain, lam);

  if (entry.bina.includes("Mitsal")) huruf = fa;
  else if (entry.bina.includes("Ajwaf")) huruf = ain;
  else if (entry.bina.includes("Naqis")) huruf = lam;
  else if (entry.bina === "Mudha'af") huruf = `${ain} = ${lam}`;
  else if (entry.bina.includes("Lafif")) huruf = `${fa}, ${lam}`;

  return {
    isShahih: false,
    binaType: entry.bina,
    asalKata,
    hasilKata,
    log,
    hurufIllat: huruf,
  };
}

function getDefaultAsal(fa: string, ain: string, lam: string, babNum: number): string {
  const F = "\u064E";
  const K = "\u0650";
  const D = "\u064F";
  if (babNum === 4 || babNum === 6) return `${fa}${F}${ain}${K}${lam}${F}`;
  if (babNum === 5) return `${fa}${F}${ain}${D}${lam}${F}`;
  return `${fa}${F}${ain}${F}${lam}${F}`;
}

function getBinaExplanation(bina: string, fa: string, ain: string, lam: string): string {
  switch (bina) {
    case "Mitsal Wawi":
      return `Fa' fi'il berupa Waw (و). Dalam fi'il mudhari' bab 2, Waw gugur karena jatuh di antara fathah dan kasrah. Di bab lain, Waw bisa tetap atau mengalami perubahan lain.`;
    case "Mitsal Ya'i":
      return `Fa' fi'il berupa Ya' (ي). Perubahan serupa dengan Mitsal Wawi.`;
    case "Ajwaf Wawi":
      return `Ain fi'il asal berupa Waw (و). Karena Waw berharakat didahului fathah pada fa', ia diubah menjadi Alif panjang dalam madhi. Di mudhari' dengan dammah, Waw tetap: يَفْعُلُ.`;
    case "Ajwaf Ya'i":
      return `Ain fi'il asal berupa Ya' (ي). Ya' berharakat didahului fathah diubah menjadi Alif di madhi. Di mudhari' bab 2 dengan kasrah, Ya' muncul kembali sebagai Ya' panjang.`;
    case "Naqis Wawi":
      return `Lam fi'il berupa Waw (و). Di akhir kata, Waw berharakat didahului fathah diubah menjadi Alif. Di mudhari', jika ain berdamma, Waw tetap di akhir.`;
    case "Naqis Ya'i":
      return `Lam fi'il berupa Ya' (ي). Di akhir kata, Ya' berharakat didahului fathah diubah menjadi Alif maqsura (ى) di madhi.`;
    case "Mudha'af":
      return `Ain dan Lam fi'il merupakan huruf yang sama. Jika keduanya berdampingan dan berharakat, diidghamkan (ditasydidkan) menjadi satu huruf dengan shadda.`;
    case "Lafif Mafruq":
      return `Fa' dan Lam fi'il berupa huruf illat, sementara Ain adalah huruf shohih. Kaidah i'lal berlaku pada kedua ujung kata.`;
    case "Lafif Maqrun":
      return `Ain dan Lam fi'il keduanya berupa huruf illat. Kaidah i'lal berlaku kompleks.`;
    default:
      return `Kata ini mengandung huruf illat (و ي ا) yang menyebabkan perubahan morfologis.`;
  }
}

export function getBabExplanation(babNum: number): {
  vocal: string;
  ringkas: string;
  karakteristik: string;
  contoh: string;
} {
  const babs: Record<number, { vocal: string; ringkas: string; karakteristik: string; contoh: string }> = {
    1: {
      vocal: "فَعَلَ - يَفْعُلُ (Fath-Dhammi)",
      ringkas: "Vokal fathah di madhi berubah menjadi dammah di mudhari'. Paling populer untuk tindakan aktif-dinamis.",
      karakteristik: "Bab 1 didominasi fi'il muta'addi yang menggambarkan perbuatan fisik aktif, tindakan terarah, atau perubahan kondisi bertahap.",
      contoh: "نَصَرَ-يَنْصُرُ (Menolong), كَتَبَ-يَكْتُبُ (Menulis), خَرَجَ-يَخْرُجُ (Keluar).",
    },
    2: {
      vocal: "فَعَلَ - يَفْعِلُ (Fath-Kasri)",
      ringkas: "Vokal fathah di madhi berubah menjadi kasrah di mudhari'. Populer untuk gerakan terukur.",
      karakteristik: "Bab 2 sering memuat fi'il bermakna gerakan terukur, suara terputus, tindakan fisik langsung, atau perlakuan terhadap objek.",
      contoh: "ضَرَبَ-يَضْرِبُ (Memukul), جَلَسَ-يَجْلِسُ (Duduk), بَاعَ-يَبِيعُ (Menjual).",
    },
    3: {
      vocal: "فَعَلَ - يَفْعَلُ (Fathatani)",
      ringkas: "Kedua fi'il menggunakan fathah. Syarat: Ain atau Lam harus berupa huruf halq.",
      karakteristik: "Morfologi mengharuskan ada Huruf Halq (ء ه ع ح غ خ) pada Ain atau Lam agar artikulasi fathah ganda sepadan dan fasih.",
      contoh: "فَتَحَ-يَفْتَحُ (Membuka), ذَهَبَ-يَذْهَبُ (Pergi), قَرَأَ-يَقْرَأُ (Membaca).",
    },
    4: {
      vocal: "فَعِلَ - يَفْعَلُ (Kasrul-Fathi)",
      ringkas: "Vokal kasrah di madhi berubah menjadi fathah di mudhari'. Ideal untuk emosi dan sifat sementara.",
      karakteristik: "Fokus bab 4 adalah mengekspresikan emosi batiniah, sifat fisik sementara, warna, atau kepemilikan penampilan luar.",
      contoh: "عَلِمَ-يَعْلَمُ (Mengetahui), فَرِحَ-يَفْرَحُ (Gembira), شَرِبَ-يَشْرَبُ (Minum).",
    },
    5: {
      vocal: "فَعُلَ - يَفْعُلُ (Dhammud-Dhammi)",
      ringkas: "Kedua fi'il menggunakan dammah. Seluruh kata bersifat lazim, melambangkan sifat bawaan permanen.",
      karakteristik: "Semua fi'il bab 5 lazim (intransitif) dan mencerminkan sifat bawaan, watak permanen, keelokan moral, atau tabiat dasar yang melekat.",
      contoh: "حَسُنَ-يَحْسُنُ (Indah), كَرُمَ-يَكْرُمُ (Mulia), صَغُرَ-يَصْغُرُ (Kecil).",
    },
    6: {
      vocal: "فَعِلَ - يَفْعِلُ (Kasratani)",
      ringkas: "Kedua fi'il menggunakan kasrah. Bab paling langka, berkaitan dengan aktivitas mental.",
      karakteristik: "Bab paling sedikit dan langka, sering merujuk pada pemahaman mental, kognisi batin, atau pewarisan hukum.",
      contoh: "حَسِبَ-يَحْسِبُ (Mengira), وَرِثَ-يَرِثُ (Mewarisi), وَثِقَ-يَثِقُ (Mempercayai).",
    },
  };
  return babs[babNum] || babs[1];
}
