import { IilalEngine as BaseIilalEngine } from "./tasrifEngine";
import { DictionaryEntry, TasrifIstilahiData } from "../type";

// Export the IilalEngine object for files importing it directly
export const IilalEngine = BaseIilalEngine;

// Safe wrapper for vocalizing Arabic roots
export function getVocalizedRoot(rootOrEntry: any, ain?: string, lam?: string, babNum?: number): string {
  if (!rootOrEntry) return "";
  
  // Case 1: getVocalizedRoot(entry) -> entry is a DictionaryEntry
  if (rootOrEntry.root && typeof rootOrEntry.root === "object") {
    return getVocalizedRootRaw(rootOrEntry.root.fa, rootOrEntry.root.ain, rootOrEntry.root.lam, rootOrEntry.babNum || 1);
  }
  
  // Case 2: getVocalizedRoot(selectedEntry.root) -> root is { fa, ain, lam }
  if (typeof rootOrEntry === "object" && rootOrEntry.fa && rootOrEntry.ain && rootOrEntry.lam) {
    return getVocalizedRootRaw(rootOrEntry.fa, rootOrEntry.ain, rootOrEntry.lam, babNum || 1);
  }
  
  // Case 3: getVocalizedRoot(fa, ain, lam, babNum)
  if (typeof rootOrEntry === "string" && ain !== undefined && lam !== undefined) {
    return getVocalizedRootRaw(rootOrEntry, ain, lam, babNum || 1);
  }

  return "";
}

function getVocalizedRootRaw(fa: string, ain: string, lam: string, babNum: number): string {
  let ainVowel = "َ"; // Fathah by default
  if (babNum === 4 || babNum === 6) {
    ainVowel = "ِ"; // Kasrah
  } else if (babNum === 5) {
    ainVowel = "ُ"; // Dhommah
  }
  return `${fa}َ${ain}${ainVowel}${lam}َ`;
}

// Generate the complete Tasrif Istilahi data
export function getTasrifIstilahi(entry: DictionaryEntry): TasrifIstilahiData {
  const { root, babNum, bina, sifatMusyabihat } = entry;
  
  let wazanMadhi = "فَعَلَ";
  let wazanMudhari = "يَفْعُلُ";
  let masdar = "فَعْلًا";
  
  if (babNum === 1) {
    wazanMadhi = "فَعَلَ";
    wazanMudhari = "يَفْعُلُ";
  } else if (babNum === 2) {
    wazanMadhi = "فَعَلَ";
    wazanMudhari = "يَفْعِلُ";
  } else if (babNum === 3) {
    wazanMadhi = "فَعَلَ";
    wazanMudhari = "يَفْعَلُ";
  } else if (babNum === 4) {
    wazanMadhi = "فَعِلَ";
    wazanMudhari = "يَفْعَلُ";
  } else if (babNum === 5) {
    wazanMadhi = "فَعُلَ";
    wazanMudhari = "يَفْعُلُ";
  } else if (babNum === 6) {
    wazanMadhi = "فَعِلَ";
    wazanMudhari = "يَفْعِلُ";
  }

  if (entry.masdar) {
    masdar = entry.masdar;
  } else if (entry.masdarSamai) {
    masdar = entry.masdarSamai.split("/")[0].trim();
  }

  const dataWazan = {
    fa: root.fa,
    ain: root.ain,
    lam: root.lam,
    babNum,
    wazanMadhi,
    wazanMudhari,
    masdar,
    sifatMusyabihat,
  };

  const istilahiRaw = BaseIilalEngine.tasrifIstilahiCustom(dataWazan);

  return {
    madhi: istilahiRaw.madhi,
    mudhari: istilahiRaw.mudhari,
    masdar: istilahiRaw.masdar,
    isimFail: istilahiRaw.isimFail.mufrod,
    isimMaful: istilahiRaw.isimMaful.mufrod,
    amr: istilahiRaw.amar,
    nahi: istilahiRaw.nahi,
    isimZamanMakan: istilahiRaw.isimZaman.mufrod,
    isimAlat: istilahiRaw.isimAlat.mufrod,
    sifatMusyabihat: istilahiRaw.isimMusyabihat.mufrod || sifatMusyabihat || "—",
    isimTashgir: istilahiRaw.isimTashghir,
  };
}

// Generate Tasrif Lughowi conjugation row data
export function getTasrifLughowi(entry: DictionaryEntry) {
  const { root, babNum, bina, sifatMusyabihat } = entry;
  
  let wazanMadhi = "فَعَلَ";
  let wazanMudhari = "يَفْعُلُ";
  let masdar = "فَعْلًا";
  
  if (babNum === 1) { wazanMadhi = "فَعَلَ"; wazanMudhari = "يَفْعُلُ"; }
  else if (babNum === 2) { wazanMadhi = "فَعَلَ"; wazanMudhari = "يَفْعِلُ"; }
  else if (babNum === 3) { wazanMadhi = "فَعَلَ"; wazanMudhari = "يَفْعَلُ"; }
  else if (babNum === 4) { wazanMadhi = "فَعِلَ"; wazanMudhari = "يَفْعَلُ"; }
  else if (babNum === 5) { wazanMadhi = "فَعُلَ"; wazanMudhari = "يَفْعُلُ"; }
  else if (babNum === 6) { wazanMadhi = "فَعِلَ"; wazanMudhari = "يَفْعِلُ"; }

  if (entry.masdar) {
    masdar = entry.masdar;
  } else if (entry.masdarSamai) {
    masdar = entry.masdarSamai.split("/")[0].trim();
  }

  const dataWazan = {
    fa: root.fa,
    ain: root.ain,
    lam: root.lam,
    babNum,
    wazanMadhi,
    wazanMudhari,
    masdar,
    sifatMusyabihat,
  };

  const istilahiRaw = BaseIilalEngine.tasrifIstilahiCustom(dataWazan);
  return BaseIilalEngine.tasrifLughowi(istilahiRaw, root.fa, root.ain, root.lam, bina, babNum);
}

// Tab loader wrappers to ensure robust caching
export function getMasdar(entry: DictionaryEntry): TasrifIstilahiData {
  return getTasrifIstilahi(entry);
}

export function getSifat(entry: DictionaryEntry): TasrifIstilahiData {
  return getTasrifIstilahi(entry);
}

export function getJamak(entry: DictionaryEntry): TasrifIstilahiData {
  return getTasrifIstilahi(entry);
}

export function getIilal(entry: DictionaryEntry): TasrifIstilahiData {
  return getTasrifIstilahi(entry);
}

// Bab explanations helper
export function getBabExplanation(babNum: number) {
  const explanations: Record<number, { name: string; pattern: string; desc: string }> = {
    1: { name: "Bab 1", pattern: "فَعَلَ - يَفْعُلُ", desc: "Fathul-Dhammi, contoh: نَصَرَ - يَنْصُرُ" },
    2: { name: "Bab 2", pattern: "فَعَلَ - يَفْعِلُ", desc: "Fathul-Kasri, contoh: ضَرَبَ - يَضْرِبُ" },
    3: { name: "Bab 3", pattern: "فَعَلَ - يَفْعَلُ", desc: "Fathatani, contoh: فَتَحَ - يَفْتَحُ" },
    4: { name: "Bab 4", pattern: "فَعِلَ - يَفْعَلُ", desc: "Kasrul-Fathi, contoh: عَلِمَ - يَعْلَمُ" },
    5: { name: "Bab 5", pattern: "فَعُلَ - يَفْعُلُ", desc: "Dhammud-Dhammi, contoh: حَسُنَ - يَحْسُنُ" },
    6: { name: "Bab 6", pattern: "فَعِلَ - يَفْعِلُ", desc: "Kasratani, contoh: حَسِبَ - يَحْسِبُ" },
  };
  return explanations[babNum] || { name: `Bab ${babNum}`, pattern: "", desc: "" };
}
