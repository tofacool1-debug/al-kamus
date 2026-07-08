import type { DictionaryEntry } from "../types";

export function getBabExplanation(babNum?: number): string {
  switch (babNum) {
    case 1:
      return "Bab pertama membahas fi'il shahih dan perubahan vokal sederhana.";
    case 2:
      return "Bab kedua membahas i'lal pada huruf 'ain dan lam dengan pola khusus.";
    case 3:
      return "Bab ketiga terkait perubahan bentuk untuk fi'il yang memiliki huruf illat.";
    case 4:
      return "Bab keempat menekankan pola i'lal pada fi'il muta'addi dan lazim.";
    case 5:
      return "Bab kelima menggabungkan kaidah i'lal dengan bentuk jamak dan ismul fa'il.";
    case 6:
      return "Bab keenam membahas bentuk mu'tal yang sering dipakai dalam percakapan.";
    default:
      return "Informasi bab belum tersedia.";
  }
}

export function getIilalExplanation(entry: DictionaryEntry) {
  const binaType = entry.bina || "Shohih";
  const hurufIllat = entry.root.ain === "و" || entry.root.ain === "ي" ? entry.root.ain : "—";

  return {
    binaType,
    hurufIllat,
    isShahih: binaType === "Shohih",
    asalKata: entry.translation || entry.id,
    hasilKata: entry.translation || entry.id,
    log: `Deteksi i'lal untuk ${entry.id} menggunakan fallback sederhana.`,
  };
}

export const IilalEngine = {
  detectBina(fa: string, ain: string, lam: string): string {
    const isFaWeak = ["و", "ي"].includes(fa);
    const isAinWeak = ["و", "ي"].includes(ain);
    const isLamWeak = ["و", "ي"].includes(lam);

    if (isFaWeak && isLamWeak) return "Lafif Mafruq";
    if (isAinWeak && isLamWeak) return "Lafif Maqrun";
    if (isFaWeak) return "Mitsal";
    if (isAinWeak) return "Ajwaf";
    if (isLamWeak) return "Naqis";
    return "Shohih";
  },
};
