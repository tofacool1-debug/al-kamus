/**
 * Comprehensive Jamak Taksir engine for Shorof Digital Pro.
 * Covers Isim Fa'il, Isim Maf'ul, Isim Zaman/Makan, and Isim Alat
 * across all 7 bina types: Shohih, Ajwaf, Mitsal, Naqis, Muda'af, Mahmuz, Lafif.
 */

import {
  DictionaryEntry,
  PluralIsimFail,
  PluralIsimMaful,
  PluralIsimZamanMakan,
  PluralIsimAlat,
} from "@/types";

// ── Shared helpers ─────────────────────────────────────────────────────────

export function getPluralBinaKey(bina: string): string {
  const norm = (bina || "").toLowerCase().trim();
  if (norm.includes("shohih") || norm === "sahih") return "sahih";
  if (norm.includes("ajwaf")) return "ajwaf";
  if (norm.includes("mitsal")) return "mitsal";
  if (norm === "naqis" || norm.includes("naqish")) return "naqish";
  if (norm.includes("muda") || norm.includes("mudho") || norm.includes("ganda")) return "mudaaf";
  if (norm.includes("mahmuz")) return "mahmuz";
  if (norm === "lafif maqrun") return "lafif_maqrun";
  if (norm === "lafif mafruq") return "lafif_mafruq";
  if (norm.includes("lafif")) return "lafif_maqrun";
  return "sahih";
}

function cd(s: string): string {
  return s.replace(/[\u064b-\u065f]/g, "");
}

/** Safe multi-pass root substitution — avoids ف/ع/ل collisions. */
function sr(pattern: string, fa: string, ain: string, lam: string): string {
  return pattern
    .replace(/ف/g, "__FA__")
    .replace(/ع/g, "__AIN__")
    .replace(/ل/g, "__LAM__")
    .replace(/__FA__/g, fa)
    .replace(/__AIN__/g, ain)
    .replace(/__LAM__/g, lam);
}

function fmtList(patterns: string[], fa: string, ain: string, lam: string, fn: (p: string, fa: string, ain: string, lam: string, bk: string) => string, bk: string): string {
  if (!patterns.length) return "—";
  return patterns.map(p => fn(p, fa, ain, lam, bk)).filter(Boolean).join(" / ");
}

// ── Isim Fa'il Plural Engine ───────────────────────────────────────────────

function replaceForIsimFail(pattern: string, fa: string, ain: string, lam: string, bk: string): string {
  let result = "";

  if (pattern === "فَاعِلُونَ") {
    if (bk === "naqish" || bk.startsWith("lafif")) {
      result = `${fa}َا${ain}ُونَ`;
    } else if (bk === "ajwaf") {
      result = `${fa}َائِ${lam}ُونَ`;
    } else if (bk === "mudaaf") {
      result = `${fa}َا${lam}ُّونَ`;
    } else {
      result = `${fa}َا${ain}ِ${lam}ُونَ`;
    }
  } else if (pattern === "فَوَاعِلُ") {
    if (bk === "mudaaf") {
      result = `${fa}َوَا${lam}ُّ`;
    } else if (bk === "ajwaf") {
      result = `${fa}َوَائِ${lam}ُ`;
    } else if (bk === "mitsal") {
      result = `أَوَا${ain}ِ${lam}ُ`;
    } else if (bk === "naqish") {
      result = `${fa}َوَا${ain}ٍ`;
    } else if (bk.startsWith("lafif")) {
      result = bk === "lafif_mafruq" || fa === "و" ? `أَوَا${ain}ٍ` : `${fa}َوَا${ain}ٍ`;
    } else {
      result = `${fa}َوَا${ain}ِ${lam}ُ`;
    }
  } else if (bk === "mudaaf" && pattern === "فَعَلَةٌ") {
    result = `${fa}َ${ain}َ${lam}َةٌ`;
  } else if (bk === "mudaaf" && pattern === "فُعَّلٌ") {
    result = `${fa}ُ${ain}َّ${lam}ٌ`;
  } else if ((bk === "naqish" || bk.startsWith("lafif")) && pattern === "فُعَلَةٌ") {
    result = `${fa}ُ${ain}َاةٌ`;
  } else if ((bk === "naqish" || bk.startsWith("lafif")) && pattern === "فُعَّالٌ") {
    result = `${fa}ُ${ain}َّاءٌ`;
  } else if ((bk === "naqish" || bk.startsWith("lafif")) && pattern === "فُعَّلٌ") {
    result = `${fa}ُ${ain}ًّى`;
  } else if (bk === "ajwaf" && pattern === "فَعَلَةٌ") {
    result = `${fa}َ${ain}َ${lam}َةٌ`;
  } else {
    result = sr(pattern, fa, ain, lam);
  }

  // Fix waw-initial collisions (Mitsal / Lafif Mafruq)
  if (result.startsWith("وَوَ") || result.startsWith("وَو")) {
    result = "أَ" + result.slice(1);
  }

  // Hamzah after dhamma → ؤ
  result = result.replace(/ُ[أإء]/g, "ُؤ");

  if (bk === "ajwaf") {
    result = result.replace(/اوِ/g, "ائِ").replace(/ايِ/g, "ائِ");
  }

  // Final hamzah cleanup
  result = result.replace(/[أإؤئء]([ٌُ])(?=$|\s)/g, "ء$1");

  return result;
}

export function analyzeIsimFail(entry: DictionaryEntry): PluralIsimFail {
  const { fa, ain, lam } = entry.root;
  const cFa = cd(fa), cAin = cd(ain), cLam = cd(lam);
  const bk = getPluralBinaKey(entry.bina || "");

  let qillah = "—", katsroh = "—", muntahal = "—";
  let contoh = "", ilalRule = "", explanation = "";

  const rfiFn = (p: string, f: string, a: string, l: string, b: string) => replaceForIsimFail(p, f, a, l, b);

  switch (bk) {
    case "sahih":
      qillah = fmtList(["أَفْعِلَةٌ", "أَفْعَالٌ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فُعَّالٌ", "فُعَّلٌ", "فَعَلَةٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "كَاتِب ← كُتَّابٌ / كُتَّبٌ / كَتَبَةٌ / كَوَاتِبُ";
      ilalRule = "Sesuai kaidah standar sharaf sahih, tanpa i'lal.";
      explanation = "Isim Fa'il bina Shohih memiliki Jamak Qillah أَفْعِلَة dan أَفْعَال, Katsroh فُعَّال / فُعَّل / فَعَلَة, dan Muntahal Jumu' فَوَاعِل.";
      break;
    case "ajwaf":
      qillah = fmtList(["فَاعِلُونَ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فَعَلَةٌ", "فُعَّالٌ", "فُعَّلٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "قَائِل ← قَائِلُونَ / قَوَمَةٌ / قُوَّالٌ / قَوَائِلُ";
      ilalRule = "Ain fi'il (waw/ya) kembali pada bentuk jamak (qalbu alif).";
      explanation = "Isim Fa'il bina Ajwaf menggunakan Jamak Qillah فَاعِلُونَ, Katsroh فَعَلَة / فُعَّال / فُعَّل, dan Muntahal فَوَاعِل dengan ain fi'il diganti hamzah.";
      break;
    case "mitsal":
      qillah = fmtList(["فَاعِلُونَ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فُعَّالٌ", "فُعَّلٌ", "فَعَلَةٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "وَاعِد ← وَاعِدُونَ / وُعَّادٌ / أَوَاعِدُ";
      ilalRule = "Fa' fi'il (waw) diubah jadi hamzah (أ) pada Muntahal Jumu' فَوَاعِل.";
      explanation = "Isim Fa'il bina Mitsal: Qillah فَاعِلُونَ, Katsroh فُعَّال / فُعَّل / فَعَلَة, Muntahal فَوَاعِل dengan perubahan fa' waw → hamzah.";
      break;
    case "naqish":
      qillah = fmtList(["فَاعِلُونَ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فُعَلَةٌ", "فُعَّالٌ", "فُعَّلٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "قَاضٍ ← قَاضُونَ / قُضَاةٌ / قُضَّاءٌ / قَوَاضٍ";
      ilalRule = "Lam fi'il dibuang, ain fi'il dikasroh-tanwin pada Muntahal. Katsroh: lam diganti alif, hamzah, ya' tanwin.";
      explanation = "Isim Fa'il bina Naqis: Qillah فَاعِلُونَ, Katsroh فُعَلَة / فُعَّال / فُعَّل, Muntahal فَوَاعِل dengan pembuangan lam fi'il.";
      break;
    case "mudaaf":
      qillah = fmtList(["أَفْعَالٌ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فَعَلَةٌ", "فُعَّلٌ", "فُعَّالٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "مَادّ ← أَمْدَادٌ / مَدَةٌ / مَوَادُّ";
      ilalRule = "Qillah: أَفْعَال. Katsroh: فَعَلَة tanpa idgham. Muntahal: فَوَاعِل dengan idgham ain+lam.";
      explanation = "Isim Fa'il bina Muda'af: Qillah أَفْعَال, Katsroh فَعَلَة / فُعَّل / فُعَّال, Muntahal فَوَاعِل dengan idgham.";
      break;
    case "mahmuz":
      qillah = fmtList(["فَاعِلُونَ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فُعَّالٌ", "فُعَّلٌ", "فَعَلَةٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "آكِل ← آكِلُونَ / أُكَّالٌ / أَوَاكِلُ";
      ilalRule = "Hamzah disesuaikan penulisannya berdasarkan harakat sekitar.";
      explanation = "Isim Fa'il bina Mahmuz mengikuti pola Shohih dengan penyesuaian penulisan hamzah.";
      break;
    default:
      qillah = fmtList(["فَاعِلُونَ"], cFa, cAin, cLam, rfiFn, bk);
      katsroh = fmtList(["فُعَلَةٌ", "فُعَّالٌ", "فُعَّلٌ"], cFa, cAin, cLam, rfiFn, bk);
      muntahal = fmtList(["فَوَاعِلُ"], cFa, cAin, cLam, rfiFn, bk);
      contoh = "طَاوٍ ← طَاوُونَ / طُوَاةٌ / أَوَاوٍ";
      ilalRule = "Aturan Lafif selaras Naqis: fa' diganti hamzah, lam dibuang, ain dikasroh-tanwin pada Muntahal.";
      explanation = "Isim Fa'il bina Lafif: Qillah فَاعِلُونَ, Katsroh فُعَلَة / فُعَّال / فُعَّل, Muntahal فَوَاعِل.";
      break;
  }

  return {
    qillah,
    katsroh,
    muntahal,
    reference: "Lisanul 'Arab · Kitab Sharaf Al-Kafi · Al-Shorof Al-Wadhih",
    explanation: `${explanation}\n\n• Kaidah I'lal: ${ilalRule}\n• Contoh: ${contoh}`,
  };
}

// ── Isim Maf'ul Plural Engine ──────────────────────────────────────────────

function replaceForIsimMaful(pattern: string, fa: string, ain: string, lam: string, bk: string): string {
  let result: string;

  if ((bk === "naqish" || bk.startsWith("lafif")) && pattern === "مَفَاعٍ") {
    result = `مَ${fa}َا${ain}ٍ`;
  } else {
    result = sr(pattern, fa, ain, lam);
  }

  // Spelling corrections
  result = result
    .replace(/مَوَاوِيُّ/g, "مَوَافِيُّ")
    .replace(/مَحَايِيُّ/g, "مَحَائِيُّ");

  // Hamzah after kasra → ئ
  result = result.replace(/([\u0621-\u064a])[أإء]ِ/g, "$1ئِ");

  // Alif maddah
  result = result
    .replace(/أَأْ/g, "آ").replace(/أَاْ/g, "آ")
    .replace(/أَأَ/g, "آ").replace(/أَاَ/g, "آ")
    .replace(/أَأ/g, "آ").replace(/أَا/g, "آ");

  // Dhamma → ؤ
  result = result.replace(/ُ[أإء]/g, "ُؤ");

  if (bk === "ajwaf") result = result.replace(/اوِ/g, "ائِ").replace(/ايِ/g, "ائِ");
  if (bk === "naqish" || bk.startsWith("lafif")) {
    result = result.replace(/ِيْ?[يio]ٌ?$/g, "ِيُّ");
  }

  result = result.replace(/[أإؤئء]([ٌُ])(?=$|\s)/g, "ء$1");
  return result;
}

function fmtMaful(patterns: string[], fa: string, ain: string, lam: string, bk: string): string {
  if (!patterns.length) return "—";
  return patterns.map(p => replaceForIsimMaful(p, fa, ain, lam, bk)).join(" / ");
}

export function analyzeIsimMafulPlural(entry: DictionaryEntry): PluralIsimMaful {
  if (entry.babNum === 5) {
    return {
      qillah: "—", katsroh: "—", muntahal: "—",
      reference: "Lisanul 'Arab · Kitab Sharaf Al-Kafi",
      explanation: "Isim Maf'ul ditiadakan untuk Bab 5 (فَعُلَ يَفْعُلُ) karena fi'il lazim tidak memerlukan objek.",
    };
  }
  if (entry.isLazim) {
    return {
      qillah: "—", katsroh: "—", muntahal: "—",
      reference: "Lisanul 'Arab · Kitab Sharaf Al-Kafi",
      explanation: "Fi'il ini termasuk lazim (intransitif), tidak memiliki Isim Maf'ul.",
    };
  }

  const { fa, ain, lam } = entry.root;
  const cFa = cd(fa), cAin = cd(ain), cLam = cd(lam);
  const bk = getPluralBinaKey(entry.bina || "");

  let qillah = "—", katsroh = "—", muntahal = "—";
  let explanation = "";

  const muntahalPattern = (bk === "naqish" || bk.startsWith("lafif")) ? "مَفَاعٍ" : "مَفَاعِيل";

  switch (bk) {
    case "sahih":
      muntahal = fmtMaful([muntahalPattern], cFa, cAin, cLam, bk);
      explanation = "Bina Shohih: Jamak Qillah/Katsroh menggunakan jama mudzakar salim dan muannas salim. Shighot Muntahal Jumu' berpola مَفَاعِيل.";
      break;
    case "ajwaf":
      muntahal = fmtMaful([muntahalPattern], cFa, cAin, cLam, bk);
      explanation = "Bina Ajwaf: alif mufrod kembali ke huruf asalnya (waw/ya) pada bentuk jamak. Shighot Muntahal berpola مَفَاعِيل.";
      break;
    case "mitsal":
      muntahal = fmtMaful([muntahalPattern], cFa, cAin, cLam, bk);
      explanation = "Bina Mitsal: waw fa' fi'il dipertahankan. Muntahal بerpola مَفَاعِيل (contoh: مَوَاعِيد dari مَوْعُود).";
      break;
    case "naqish":
      muntahal = fmtMaful(["مَفَاعٍ"], cFa, cAin, cLam, bk);
      explanation = "Bina Naqis: lam fi'il dibuang, ain fi'il dikasroh-tanwin pada Muntahal مَفَاعٍ (contoh: مَرَامٍ dari مَرْمِيّ).";
      break;
    case "mudaaf":
      muntahal = fmtMaful([muntahalPattern], cFa, cAin, cLam, bk);
      explanation = "Bina Muda'af: fakk idgham — dua huruf kembar diurai pada Muntahal مَفَاعِيل (contoh: مَحَابِيب dari مَحْبُوب).";
      break;
    case "mahmuz":
      muntahal = fmtMaful([muntahalPattern], cFa, cAin, cLam, bk);
      explanation = "Bina Mahmuz: hamzah disesuaikan penulisannya (ibdal). Muntahal مَفَاعِيل (contoh: مَسَائِيل).";
      break;
    default:
      muntahal = fmtMaful(["مَفَاعٍ"], cFa, cAin, cLam, bk);
      explanation = "Bina Lafif: lam fi'il dibuang, Muntahal مَفَاعٍ (contoh: مَطَاوٍ).";
      break;
  }

  return {
    qillah, katsroh, muntahal,
    reference: "Lisanul 'Arab · Kitab Sharaf Al-Kafi · Al-Shorof Al-Wadhih",
    explanation: `${explanation}\n\n• Catatan: Jamak Qillah dan Katsroh dikembalikan ke Jama Mudzakar Salim dan Jama Muannas Salim.`,
  };
}

// ── Isim Zaman/Makan Plural Engine ────────────────────────────────────────

function replaceForZM(pattern: string, fa: string, ain: string, lam: string, bk: string): string {
  if (bk === "naqish" || bk.startsWith("lafif")) {
    if (pattern === "مَفَاعِ" || pattern === "مَفَاعٍ") return `مَ${fa}َا${ain}ٍ`;
    if (pattern === "مَفَاعِيل") return `مَ${fa}َا${ain}ِي${lam}`;
  }
  if (bk === "mudaaf" && pattern === "مَفَاعِل") return `مَ${fa}َا${lam}ّ`;

  const result = sr(pattern, fa, ain, lam);

  if (bk === "ajwaf") return result.replace(/اوِ/g, "ائِ").replace(/ايِ/g, "ائِ");
  return result;
}

export function analyzeIsimZamanMakanPlural(entry: DictionaryEntry): PluralIsimZamanMakan {
  const { fa, ain, lam } = entry.root;
  const cFa = cd(fa), cAin = cd(ain), cLam = cd(lam);
  const bk = getPluralBinaKey(entry.bina || "");

  const isFaMitsal = cFa === "و";
  const defaultMufrod = isFaMitsal ? `مَ${cFa}ْ${cAin}ِ${cLam}ٌ` : `مَ${cFa}ْ${cAin}َ${cLam}ٌ`;

  let qillah = "—", katsroh = "—", muntahal = "—";
  let contoh = "", ilalRule = "", explanation = "";

  const fmtZM = (ps: string[]) => fmtList(ps, cFa, cAin, cLam, replaceForZM, bk);

  switch (bk) {
    case "sahih":
      muntahal = fmtZM(["مَفَاعِل"]);
      contoh = "مَسْجِد ← مَسَاجِد"; ilalRule = "Tidak ada I'lal.";
      explanation = "Bina Shohih: Muntahal Jumu' berpola مَفَاعِل (contoh: مَسَاجِد dari مَسْجِد).";
      break;
    case "ajwaf":
      muntahal = fmtZM(["مَفَاعِل"]);
      contoh = "مَقَام ← مَقَاوِم"; ilalRule = "Alif mufrod kembali ke huruf asalnya.";
      explanation = "Bina Ajwaf: alif di mufrod berubah ke huruf asal (waw/ya) pada Muntahal مَفَاعِل.";
      break;
    case "mitsal":
      muntahal = fmtZM(["مَفَاعِل"]);
      contoh = "مَوْعِد ← مَوَاعِد"; ilalRule = "Waw fa' fi'il dipertahankan.";
      explanation = "Bina Mitsal: waw tetap utuh dalam Muntahal مَفَاعِل (contoh: مَوَاعِد).";
      break;
    case "naqish":
      muntahal = fmtZM(["مَفَاعٍ"]);
      contoh = "مَرْمَى ← مَرَامٍ"; ilalRule = "Lam fi'il dibuang, ain dikasroh-tanwin.";
      explanation = "Bina Naqis: Muntahal Jumu' بerpola مَفَاعٍ (contoh: مَرَامٍ dari مَرْمَى).";
      break;
    case "mudaaf":
      muntahal = fmtZM(["مَفَاعِل"]);
      contoh = "مَقَرّ ← مَقَارّ"; ilalRule = "Idgham: dua huruf akhir menyatu (tasydid).";
      explanation = "Bina Muda'af: Muntahal مَفَاعِل dengan idgham di akhir (contoh: مَقَارّ).";
      break;
    case "mahmuz":
      muntahal = fmtZM(["مَفَاعِل"]);
      contoh = "مَبْدَأ ← مَبَادِئ"; ilalRule = "Hamzah disesuaikan (ibdal).";
      explanation = "Bina Mahmuz: Muntahal مَفَاعِل dengan hamzah disesuaikan (contoh: مَبَادِئ).";
      break;
    case "lafif_maqrun":
      muntahal = fmtZM(["مَفَاعٍ"]);
      contoh = "مَطْوَى ← مَطَاوٍ"; ilalRule = "Dua huruf illat dibuang.";
      explanation = "Bina Lafif Maqrun: Muntahal مَفَاعٍ (contoh: مَطَاوٍ dari مَطْوَى).";
      break;
    default:
      muntahal = fmtZM(["مَفَاعٍ"]);
      contoh = "مَوْقَى ← مَوَاقٍ"; ilalRule = "Huruf illat akhir dibuang.";
      explanation = "Bina Lafif Mafruq: Muntahal مَفَاعٍ (contoh: مَوَاقٍ).";
      break;
  }

  return {
    mufrod: defaultMufrod,
    qillah, katsroh, muntahal,
    reference: "Lisanul 'Arab · Kitab Sharaf Al-Kafi · Al-Shorof Al-Wadhih",
    explanation: `${explanation}\n\n• Kaidah I'lal: ${ilalRule}\n• Contoh Klasik: ${contoh}`,
  };
}

// ── Isim Alat Plural Engine ────────────────────────────────────────────────

function replaceForIsimAlat(pattern: string, fa: string, ain: string, lam: string, bk: string): string {
  const cp = cd(pattern);

  if (bk === "naqish" || bk.startsWith("lafif")) {
    if (cp === "مفاعيل") return `مَ${fa}َا${ain}ِيُّ`;
    if (cp === "مفاعل")  return `مَ${fa}َا${ain}ٍ`;
  }
  if (bk === "ajwaf") {
    if (cp === "مفاعيل") return `مَ${fa}َائِي${lam}ُ`;
    if (cp === "مفاعل")  return `مَ${fa}َائِ${lam}ُ`;
  }
  if (bk === "mudaaf" && cp === "مفاعل") return `مَ${fa}َا${lam}ّ`;

  const result = sr(pattern, fa, ain, lam);
  return result.replace(/[أإؤئء]([ٌُ])(?=$|\s)/g, "ء$1");
}

function fmtAlat(patterns: string[], fa: string, ain: string, lam: string, bk: string): string {
  if (!patterns.length) return "—";
  return patterns.map(p => replaceForIsimAlat(p, fa, ain, lam, bk)).join(" / ");
}

export function analyzeIsimAlatPlural(entry: DictionaryEntry): PluralIsimAlat {
  if (entry.babNum === 4) {
    return { mufrod: "—", qillah: "—", katsroh: "—", muntahal: "—", reference: "—", explanation: "Bab 4 tidak memiliki wazan Isim Alat." };
  }
  if (entry.babNum === 5) {
    return { mufrod: "—", qillah: "(—)", katsroh: "(—)", muntahal: "(—)", reference: "—", explanation: "Isim Alat dikosongkan untuk Bab 5 (fi'il lazim)." };
  }

  const { fa, ain, lam } = entry.root;
  const cFa = cd(fa), cAin = cd(ain), cLam = cd(lam);
  const bk = getPluralBinaKey(entry.bina || "");
  const defaultMufrod = `مِ${cFa}ْ${cAin}َ${cLam}ٌ`;

  let qillah = "—", katsroh = "—", muntahal = "—";
  let contoh = "", ilalRule = "", explanation = "";

  const patterns = bk === "naqish" || bk.startsWith("lafif") ? ["مفاعيل", "مَفَاعِل"] : ["مفاعيل", "مَفَاعِل"];
  muntahal = fmtAlat(patterns, cFa, cAin, cLam, bk);

  switch (bk) {
    case "sahih":    contoh = "مِفْتَاح ← مَفَاتِيح"; ilalRule = "Tidak ada I'lal."; explanation = "Bina Shohih: Muntahal Jumu' مَفَاعِيل (contoh: مَفَاتِيح) dan مَفَاعِل."; break;
    case "ajwaf":   contoh = "مِخْيَاط ← مَخَائِيط"; ilalRule = "Ain fi'il diganti hamzah (ئ)."; explanation = "Bina Ajwaf: ain fi'il → hamzah pada Muntahal مَفَاعِل / مَفَاعِيل."; break;
    case "mitsal":  contoh = "مِوْزَان ← مَوَازِين"; ilalRule = "Waw fa' tetap."; explanation = "Bina Mitsal: waw fa' dipertahankan. Muntahal مَفَاعِيل (contoh: مَوَازِين)."; break;
    case "naqish":  contoh = "مِغْزَى ← مَغَازِيُّ / مَغَازٍ"; ilalRule = "Lam fi'il dibuang; على pada مَفَاعِيل ya' ditasydid, pada مَفَاعِل ain dikasroh-tanwin."; explanation = "Bina Naqis: Muntahal مَفَاعِيل (مَغَازِيُّ) dan مَفَاعٍ (مَغَازٍ)."; break;
    case "mudaaf":  contoh = "مِقَصّ ← مَقَاصّ"; ilalRule = "Idgham: dua huruf akhir menyatu."; explanation = "Bina Muda'af: Muntahal مَفَاعِل dengan idgham (مَقَاصّ)."; break;
    case "mahmuz":  contoh = "مِئْزَر ← مَآزِر"; ilalRule = "Hamzah + alif → alif maddah (آ)."; explanation = "Bina Mahmuz: alif maddah muncul pada Muntahal (مَآزِر)."; break;
    default:        contoh = "مِطْوَى ← مَطَاوِيُّ / مَطَاوٍ"; ilalRule = "Lam fi'il dibuang seperti Naqis."; explanation = "Bina Lafif: Muntahal seperti Naqis, مَفَاعِيُّ dan مَفَاعٍ."; break;
  }

  return {
    mufrod: defaultMufrod,
    qillah, katsroh, muntahal,
    reference: "Lisanul 'Arab · Kitab Sharaf Al-Kafi · Al-Shorof Al-Wadhih",
    explanation: `${explanation}\n\n• Kaidah I'lal: ${ilalRule}\n• Contoh Klasik: ${contoh}`,
  };
}
