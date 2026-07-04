import { DictionaryEntry, TasrifIstilahiData, TasrifLughowiRow } from "@/types";

// Arabic harakat Unicode constants
const F = "\u064E"; // fathah
const D = "\u064F"; // dammah
const K = "\u0650"; // kasrah
const S = "\u0652"; // sukun
const TD = "\u064C"; // tanwin damm
const TF = "\u064B"; // tanwin fath

function ainVowelMadhi(babNum: number): string {
  if (babNum === 4 || babNum === 6) return K;
  if (babNum === 5) return D;
  return F;
}

function ainVowelMudhari(babNum: number): string {
  if (babNum === 1 || babNum === 5) return D;
  if (babNum === 2 || babNum === 6) return K;
  return F; // bab 3, 4
}

export function getVocalizedRoot(entry: DictionaryEntry): string {
  if (entry.madhi) return entry.madhi;
  const { fa, ain, lam } = entry.root;
  const av = ainVowelMadhi(entry.babNum);
  return `${fa}${F}${ain}${av}${lam}${F}`;
}

function isShahih(entry: DictionaryEntry): boolean {
  return entry.bina === "Shohih";
}

export function getTasrifIstilahi(entry: DictionaryEntry): TasrifIstilahiData {
  const { fa, ain, lam } = entry.root;
  const bab = entry.babNum;

  // For non-shahih (mu'tal) verbs, use pre-stored forms
  if (!isShahih(entry)) {
    const ainV = ainVowelMudhari(bab);
    const prefixV = ainV === D ? D : K;
    return {
      madhi: entry.madhi || `${fa}${F}${ain}${F}${lam}${F}`,
      mudhari: entry.mudhari || `يَ${fa}${S}${ain}${ainV}${lam}${D}`,
      masdar: entry.masdar || "—",
      isimFail: entry.isimFail || `${fa}${F}ا${ain}${K}${lam}${TD}`,
      isimMaful: entry.isLazim ? "—" : (entry.isimMaful || `مَ${fa}${S}${ain}${D}و${lam}${TD}`),
      amr: entry.amr || `ا${prefixV}${fa}${S}${ain}${ainV}${lam}${S}`,
      nahi: entry.nahi || `لَا تَ${fa}${S}${ain}${ainV}${lam}${S}`,
      isimZamanMakan: entry.isimZamanMakan || `مَ${fa}${S}${ain}${F}${lam}${TD}`,
      sifatMusyabihat: entry.sifatMusyabihat || "—",
      isimAlat: entry.isimAlat || "—",
    };
  }

  const ainVMadhi = ainVowelMadhi(bab);
  const ainVMudhari = ainVowelMudhari(bab);
  const prefixV = ainVMudhari === D ? D : K;

  // Isim Zaman/Makan vowel depends on mudhari' ain
  const izkAinV = (bab === 2 || bab === 6) ? K : F;

  return {
    madhi: `${fa}${F}${ain}${ainVMadhi}${lam}${F}`,
    mudhari: `يَ${fa}${S}${ain}${ainVMudhari}${lam}${D}`,
    masdar: entry.masdar || `${fa}${F}${ain}${S}${lam}${TF}ا`,
    isimFail: `${fa}${F}ا${ain}${K}${lam}${TD}`,
    isimMaful: entry.isLazim ? "—" : `مَ${fa}${S}${ain}${D}و${lam}${TD}`,
    amr: `ا${prefixV}${fa}${S}${ain}${ainVMudhari}${lam}${S}`,
    nahi: `لَا تَ${fa}${S}${ain}${ainVMudhari}${lam}${S}`,
    isimZamanMakan: `مَ${fa}${S}${ain}${izkAinV}${lam}${TD}`,
    sifatMusyabihat: entry.sifatMusyabihat || "—",
    isimAlat: entry.isimAlat || "—",
  };
}

export function getMadhiLughowi(entry: DictionaryEntry): TasrifLughowiRow[] {
  const { fa, ain, lam } = entry.root;
  const bab = entry.babNum;

  if (!isShahih(entry)) {
    const base = entry.madhi || getVocalizedRoot(entry);
    return [
      { dhamir: "هو",    dhamirAr: "هُوَ",      form: base },
      { dhamir: "هي",    dhamirAr: "هِيَ",      form: `${base}تْ` },
      { dhamir: "هما م", dhamirAr: "هُمَا",     form: `${base}ا` },
      { dhamir: "هما ف", dhamirAr: "هُمَا",     form: `${base}تَا` },
      { dhamir: "هم",    dhamirAr: "هُمْ",      form: `${base.slice(0, -1)}${D}وا` },
      { dhamir: "هن",    dhamirAr: "هُنَّ",     form: `${base.slice(0, -1)}${S}نَ` },
      { dhamir: "أنت",   dhamirAr: "أَنْتَ",    form: `${base.slice(0, -1)}${S}تَ` },
      { dhamir: "أنتِ",  dhamirAr: "أَنْتِ",    form: `${base.slice(0, -1)}${S}تِ` },
      { dhamir: "أنتما", dhamirAr: "أَنْتُمَا", form: `${base.slice(0, -1)}${S}تُمَا` },
      { dhamir: "أنتم",  dhamirAr: "أَنْتُمْ",  form: `${base.slice(0, -1)}${S}تُمْ` },
      { dhamir: "أنتن",  dhamirAr: "أَنْتُنَّ", form: `${base.slice(0, -1)}${S}تُنَّ` },
      { dhamir: "أنا",   dhamirAr: "أَنَا",     form: `${base.slice(0, -1)}${S}تُ` },
      { dhamir: "نحن",   dhamirAr: "نَحْنُ",    form: `${base.slice(0, -1)}${S}نَا` },
    ];
  }

  const av = ainVowelMadhi(bab);

  return [
    { dhamir: "هو",    dhamirAr: "هُوَ",      form: `${fa}${F}${ain}${av}${lam}${F}` },
    { dhamir: "هي",    dhamirAr: "هِيَ",      form: `${fa}${F}${ain}${av}${lam}${F}تْ` },
    { dhamir: "هما م", dhamirAr: "هُمَا",     form: `${fa}${F}${ain}${av}${lam}${F}ا` },
    { dhamir: "هما ف", dhamirAr: "هُمَا",     form: `${fa}${F}${ain}${av}${lam}${F}تَا` },
    { dhamir: "هم",    dhamirAr: "هُمْ",      form: `${fa}${F}${ain}${av}${lam}${D}وا` },
    { dhamir: "هن",    dhamirAr: "هُنَّ",     form: `${fa}${F}${ain}${av}${lam}${S}نَ` },
    { dhamir: "أنت",   dhamirAr: "أَنْتَ",    form: `${fa}${F}${ain}${av}${lam}${S}تَ` },
    { dhamir: "أنتِ",  dhamirAr: "أَنْتِ",    form: `${fa}${F}${ain}${av}${lam}${S}تِ` },
    { dhamir: "أنتما", dhamirAr: "أَنْتُمَا", form: `${fa}${F}${ain}${av}${lam}${S}تُمَا` },
    { dhamir: "أنتم",  dhamirAr: "أَنْتُمْ",  form: `${fa}${F}${ain}${av}${lam}${S}تُمْ` },
    { dhamir: "أنتن",  dhamirAr: "أَنْتُنَّ", form: `${fa}${F}${ain}${av}${lam}${S}تُنَّ` },
    { dhamir: "أنا",   dhamirAr: "أَنَا",     form: `${fa}${F}${ain}${av}${lam}${S}تُ` },
    { dhamir: "نحن",   dhamirAr: "نَحْنُ",    form: `${fa}${F}${ain}${av}${lam}${S}نَا` },
  ];
}

export function getMudhariLughowi(entry: DictionaryEntry): TasrifLughowiRow[] {
  const { fa, ain, lam } = entry.root;
  const bab = entry.babNum;

  if (!isShahih(entry)) {
    const base = entry.mudhari || `يَ${fa}${S}${ain}${F}${lam}${D}`;
    const stem = base.slice(2); // remove يَ prefix
    return [
      { dhamir: "هو",    dhamirAr: "هُوَ",      form: `يَ${stem}` },
      { dhamir: "هي",    dhamirAr: "هِيَ",      form: `تَ${stem}` },
      { dhamir: "هما م", dhamirAr: "هُمَا",     form: `يَ${stem.slice(0, -1)}${F}انِ` },
      { dhamir: "هما ف", dhamirAr: "هُمَا",     form: `تَ${stem.slice(0, -1)}${F}انِ` },
      { dhamir: "هم",    dhamirAr: "هُمْ",      form: `يَ${stem}ونَ` },
      { dhamir: "هن",    dhamirAr: "هُنَّ",     form: `يَ${stem.slice(0, -1)}${S}نَ` },
      { dhamir: "أنت",   dhamirAr: "أَنْتَ",    form: `تَ${stem}` },
      { dhamir: "أنتِ",  dhamirAr: "أَنْتِ",    form: `تَ${stem.slice(0, -1)}${K}ينَ` },
      { dhamir: "أنتما", dhamirAr: "أَنْتُمَا", form: `تَ${stem.slice(0, -1)}${F}انِ` },
      { dhamir: "أنتم",  dhamirAr: "أَنْتُمْ",  form: `تَ${stem}ونَ` },
      { dhamir: "أنتن",  dhamirAr: "أَنْتُنَّ", form: `تَ${stem.slice(0, -1)}${S}نَ` },
      { dhamir: "أنا",   dhamirAr: "أَنَا",     form: `أَ${stem}` },
      { dhamir: "نحن",   dhamirAr: "نَحْنُ",    form: `نَ${stem}` },
    ];
  }

  const av = ainVowelMudhari(bab);

  return [
    { dhamir: "هو",    dhamirAr: "هُوَ",      form: `يَ${fa}${S}${ain}${av}${lam}${D}` },
    { dhamir: "هي",    dhamirAr: "هِيَ",      form: `تَ${fa}${S}${ain}${av}${lam}${D}` },
    { dhamir: "هما م", dhamirAr: "هُمَا",     form: `يَ${fa}${S}${ain}${av}${lam}${F}انِ` },
    { dhamir: "هما ف", dhamirAr: "هُمَا",     form: `تَ${fa}${S}${ain}${av}${lam}${F}انِ` },
    { dhamir: "هم",    dhamirAr: "هُمْ",      form: `يَ${fa}${S}${ain}${av}${lam}${D}ونَ` },
    { dhamir: "هن",    dhamirAr: "هُنَّ",     form: `يَ${fa}${S}${ain}${av}${lam}${S}نَ` },
    { dhamir: "أنت",   dhamirAr: "أَنْتَ",    form: `تَ${fa}${S}${ain}${av}${lam}${D}` },
    { dhamir: "أنتِ",  dhamirAr: "أَنْتِ",    form: `تَ${fa}${S}${ain}${av}${lam}${K}ينَ` },
    { dhamir: "أنتما", dhamirAr: "أَنْتُمَا", form: `تَ${fa}${S}${ain}${av}${lam}${F}انِ` },
    { dhamir: "أنتم",  dhamirAr: "أَنْتُمْ",  form: `تَ${fa}${S}${ain}${av}${lam}${D}ونَ` },
    { dhamir: "أنتن",  dhamirAr: "أَنْتُنَّ", form: `تَ${fa}${S}${ain}${av}${lam}${S}نَ` },
    { dhamir: "أنا",   dhamirAr: "أَنَا",     form: `أَ${fa}${S}${ain}${av}${lam}${D}` },
    { dhamir: "نحن",   dhamirAr: "نَحْنُ",    form: `نَ${fa}${S}${ain}${av}${lam}${D}` },
  ];
}

// Plural helpers
export function getIsimFailPlural(entry: DictionaryEntry): { qillah: string; katsroh: string; muntahal: string } {
  const { fa, ain, lam } = entry.root;
  if (!entry.bina.startsWith("Shohih")) {
    return { qillah: "—", katsroh: "—", muntahal: "مَفَاعِيلُ (kompleks)" };
  }
  return {
    qillah: `أَ${fa}${"\u064E"}${ain}${"\u064B"}ا${lam}ٌ`, // أَفْعَالٌ (simple)
    katsroh: `${fa}${"\u064F"}${ain}${"\u0651"}${"\u064E"}${lam}ٌ`, // فُعَّالٌ
    muntahal: `${fa}${"\u064E"}و${"\u064E"}ا${ain}${"\u0650"}${lam}ُ`, // فَوَاعِلُ
  };
}

export function getIsimMafulPlural(entry: DictionaryEntry): { katsroh: string; muntahal: string } {
  const { fa, ain, lam } = entry.root;
  if (entry.isLazim) return { katsroh: "(lazim)", muntahal: "(lazim)" };
  return {
    katsroh: `مَ${fa}${"\u064E"}ا${ain}${"\u0650"}${lam}ُ`, // مَفَاعِلُ
    muntahal: `مَ${fa}${"\u064E"}ا${ain}${"\u0650"}ي${lam}ُ`, // مَفَاعِيلُ
  };
}
