/**
 * Sifat Musyabihat plural analysis engine for Shorof Digital Pro.
 * Computes Mufrod Mudzakkar, Mufrod Muannats, Katsroh, and Muntahal Jumu'
 * for all recognized wazan types across 7 bina families.
 */

import { DictionaryEntry, PluralSifatMusyabihat } from "@/types";
import { getPluralBinaKey } from "@/utils/jamakEngine";

function cd(s: string): string {
  return s.replace(/[\u064b-\u065f]/g, "");
}

/** Safe pattern substitution to avoid ف/ع/ل collision. */
function sub(pattern: string, fa: string, ain: string, lam: string, bk: string): string {
  // Special per-pattern logic (matches reference file's substituteSifatPatternRaw)
  const cFa = fa, cAin = ain, cLam = lam;

  if (pattern === "أَفْعَلُ") {
    if (bk === "mudaaf") return `أَ${cFa}َ${cLam}ُّ`;
    if (bk === "ajwaf")  return `أَ${cFa}َا${cLam}ُ`;
    if (bk === "naqish" || bk === "lafif") return `أَ${cFa}ْ${cAin}َى`;
    return `أَ${cFa}ْ${cAin}َ${cLam}ُ`;
  }
  if (pattern === "فَعْلَاءُ") {
    if (bk === "mudaaf") return `${cFa}َ${cAin}َّاءُ`;
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ْوَاءُ`;
    return `${cFa}َ${cAin}ْ${cLam}َاءُ`;
  }
  if (pattern === "فَعْلَانُ") {
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ْيَانُ`;
    return `${cFa}َ${cAin}ْ${cLam}َانُ`;
  }
  if (pattern === "فَعْلَى") {
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ْيَى`;
    return `${cFa}َ${cAin}ْ${cLam}ى`;
  }
  if (pattern === "فَعِيلٌ") {
    if (bk === "mudaaf") return `${cFa}َ${cAin}ِ${cLam}ٌ`;
    if (bk === "ajwaf")  return `${cFa}َيِّ${cLam}ٌ`;
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ِىٌّ`;
    return `${cFa}َ${cAin}ِي${cLam}ٌ`;
  }
  if (pattern === "فَعِيلَةٌ") {
    if (bk === "ajwaf")  return `${cFa}َيِّ${cLam}َةٌ`;
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ِيَّةٌ`;
    return `${cFa}َ${cAin}ِي${cLam}َةٌ`;
  }
  if (pattern === "فَعِيَّةٌ") return `${cFa}َ${cAin}ِيَّةٌ`;
  if (pattern === "فَعَالٌ") {
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}َاٍ`;
    return `${cFa}َ${cAin}َا${cLam}ٌ`;
  }
  if (pattern === "فَعَالَةٌ") {
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}َاِيَةٌ`;
    return `${cFa}َ${cAin}َا${cLam}َةٌ`;
  }
  if (pattern === "فَعِلٌ") {
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ٍ`;
    return `${cFa}َ${cAin}ِ${cLam}ٌ`;
  }
  if (pattern === "فَعِلَةٌ") {
    if (bk === "naqish" || bk === "lafif") return `${cFa}َ${cAin}ِيَةٌ`;
    return `${cFa}َ${cAin}ِ${cLam}َةٌ`;
  }
  if (pattern === "فَعَلٌ") return `${cFa}َ${cAin}َ${cLam}ٌ`;
  if (pattern === "فَعَلَةٌ") return `${cFa}َ${cAin}َ${cLam}َةٌ`;
  if (pattern === "فَعْلٌ") {
    if (bk === "mudaaf") return `${cFa}َ${cLam}ٌّ`;
    return `${cFa}َ${cAin}ْ${cLam}ٌ`;
  }
  if (pattern === "فَعْلَةٌ") {
    if (bk === "mudaaf") return `${cFa}َ${cLam}َّةٌ`;
    return `${cFa}َ${cAin}ْ${cLam}َةٌ`;
  }
  if (pattern === "فُعْلٌ") {
    if (bk === "mudaaf") return `${cFa}ُ${cLam}ٌّ`;
    return `${cFa}ُ${cAin}ْ${cLam}ٌ`;
  }
  if (pattern === "فُعْلَانُ") return `${cFa}ُ${cAin}ْ${cLam}َانُ`;
  if (pattern === "فُعَالَى") return `${cFa}ُ${cAin}َ${cLam}َى`;
  if (pattern === "فَعَالَى") return `${cFa}َ${cAin}َا${cLam}َى`;
  if (pattern === "فُعَلَاءُ") return `${cFa}ُ${cAin}َ${cLam}َاءُ`;
  if (pattern === "أَفْعِلَاءُ") return `أَ${cFa}ْ${cAin}ِ${cLam}َاءُ`;
  if (pattern === "أَفِعَّاءُ") return `أَ${cFa}ِ${cLam}َّاءُ`;
  if (pattern === "أَفْعِيَّاءُ") return `أَ${cFa}ْ${cAin}ِيَّاءُ`;
  if (pattern === "فِعَالٌ") return `${cFa}ِ${cAin}َا${cLam}ٌ`;
  if (pattern === "أَفْعَالٌ") return `أَ${cFa}ْ${cAin}َا${cLam}ٌ`;
  if (pattern === "فُعُلٌ") {
    if (bk === "mudaaf") return `${cFa}ُ${cLam}ٌّ`;
    return `${cFa}ُ${cAin}ُ${cLam}ٌ`;
  }
  if (pattern === "فُعُولٌ") {
    if (bk === "mudaaf") return `${cFa}ُ${cLam}ُّ`;
    return `${cFa}ُ${cAin}ُو${cLam}ٌ`;
  }
  if (pattern === "أَفَاعِيلُ") return `أَ${cFa}َا${cAin}ِي${cLam}ُ`;
  if (pattern === "مَفَاعِلُ") return `مَ${cFa}َا${cAin}ِ${cLam}ُ`;
  if (pattern === "فَعَائِلُ") return `${cFa}َ${cAin}َائِ${cLam}ُ`;
  if (pattern === "فَعَايَا") return `${cFa}َ${cAin}َايَا`;
  if (pattern === "فَعِلُونَ") return `${cFa}َ${cAin}ِ${cLam}ُونَ`;

  // Generic fallback
  return pattern
    .replace(/ف/g, "__FA__").replace(/ع/g, "__AIN__").replace(/ل/g, "__LAM__")
    .replace(/__FA__/g, cFa).replace(/__AIN__/g, cAin).replace(/__LAM__/g, cLam);
}

/** Detect the active wazan from the raw sifat string. */
function detectWazan(rawSifat: string): string {
  const cs = cd(rawSifat);
  if (rawSifat.includes("أَفْعَل") || (cs.startsWith("أ") && cs.length === 4 && cs[2] !== "ي")) return "أَفْعَلُ";
  if (rawSifat.includes("فَعْلَان") || cs.endsWith("ان")) return "فَعْلَانُ";
  if (cs.length === 4 && cs[2] === "ا" && !cs.startsWith("أ") && !rawSifat.includes("فَاعِل")) return "فَعَالٌ";
  if (rawSifat.includes("فَعُول") || (cs.length === 4 && cs[2] === "و" && !cs.startsWith("م"))) return "فَعُولٌ";
  if (rawSifat.includes("فَعِيل") || (cs.length === 4 && (cs[2] === "ي" || cs[2] === "ى"))) return "فَعِيلٌ";
  if ((cs.length === 3 && rawSifat.includes("ِ") && !rawSifat.includes("ّ") && !cs.endsWith("ي") && !cs.endsWith("ى"))) return "فَعِلٌ";
  if (cs.length === 3 && !rawSifat.includes("ِ") && !rawSifat.includes("ُ") && !rawSifat.includes("ْ") && !rawSifat.includes("ّ")) return "فَعَلٌ";
  if (rawSifat.includes("صَعْب") || rawSifat.includes("سَهْل")) return "فَعْلٌ";
  return "فَعِيلٌ"; // default
}

function analyzeSingle(entry: DictionaryEntry, rawSifat: string): PluralSifatMusyabihat {
  const { fa, ain, lam } = entry.root;
  const cFa = cd(fa), cAin = cd(ain), cLam = cd(lam);
  const bk = getPluralBinaKey(entry.bina || "");

  if (!rawSifat || rawSifat === "—") {
    return {
      mufrod_mudzakkar: "—", mufrod_muannas: "—", katsroh: "—",
      qillah: "—", muntahal: "—", wazan_name: "—", isQiyasi: false,
      isSamai: false, reference: "—", explanation: "Tidak ada Sifat Musyabihat.",
    };
  }

  const wazan = detectWazan(rawSifat);
  let mudzakkar = "", muannas = "", katsroh = "", muntahal = "", explanation = "";
  const isSamai = wazan === "فَعَلٌ" || wazan === "فَعْلٌ";

  switch (wazan) {
    case "أَفْعَلُ":
      mudzakkar = sub("أَفْعَلُ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعْلَاءُ", cFa, cAin, cLam, bk);
      katsroh   = `${sub("فُعْلٌ", cFa, cAin, cLam, bk)} / ${sub("فُعْلَانُ", cFa, cAin, cLam, bk)}`;
      muntahal  = "—";
      explanation = "Wazan أَفْعَلُ (muannats: فَعْلَاءُ). Jamak: فُعْلٌ / فُعْلَانُ (warna & cacat).";
      break;
    case "فَعْلَانُ":
      mudzakkar = sub("فَعْلَانُ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعْلَى", cFa, cAin, cLam, bk);
      katsroh   = sub("فِعَالٌ", cFa, cAin, cLam, bk);
      muntahal  = sub("فَعَالَى", cFa, cAin, cLam, bk);
      explanation = "Wazan فَعْلَانُ (muannats: فَعْلَى). Jamak: فِعَالٌ, Muntahal: فَعَالَى.";
      break;
    case "فَعَالٌ":
      mudzakkar = sub("فَعَالٌ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعَالَةٌ", cFa, cAin, cLam, bk);
      katsroh   = `${sub("فُعْلٌ", cFa, cAin, cLam, bk)} / ${sub("فُعَلَاءُ", cFa, cAin, cLam, bk)} / ${sub("أَفْعَالٌ", cFa, cAin, cLam, bk)}`;
      muntahal  = sub("أَفَاعِيلُ", cFa, cAin, cLam, bk);
      explanation = "Wazan فَعَالٌ (muannats: فَعَالَةٌ). Jamak: فُعْلٌ / فُعَلَاءُ / أَفْعَالٌ, Muntahal: أَفَاعِيلُ.";
      break;
    case "فَعُولٌ":
      mudzakkar = sub("فَعِيلٌ", cFa, cAin, cLam, bk);
      muannas   = "—";
      katsroh   = sub("فُعُلٌ", cFa, cAin, cLam, bk);
      muntahal  = "—";
      explanation = "Wazan فَعُولٌ (mudzakkar = muannats). Jamak: فُعُلٌ.";
      break;
    case "فَعِلٌ":
      mudzakkar = sub("فَعِلٌ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعِلَةٌ", cFa, cAin, cLam, bk);
      katsroh   = `${sub("أَفْعَالٌ", cFa, cAin, cLam, bk)} / ${sub("فَعِلُونَ", cFa, cAin, cLam, bk)}`;
      muntahal  = "—";
      explanation = "Wazan فَعِلٌ (muannats: فَعِلَةٌ). Jamak: أَفْعَالٌ / فَعِلُونَ.";
      break;
    case "فَعَلٌ":
      mudzakkar = sub("فَعَلٌ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعَلَةٌ", cFa, cAin, cLam, bk);
      katsroh   = sub("فِعَالٌ", cFa, cAin, cLam, bk);
      muntahal  = sub("مَفَاعِلُ", cFa, cAin, cLam, bk);
      explanation = "Wazan فَعَلٌ (muannats: فَعَلَةٌ). Jamak: فِعَالٌ, Muntahal: مَفَاعِلُ.";
      break;
    case "فَعْلٌ":
      mudzakkar = sub("فَعْلٌ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعْلَةٌ", cFa, cAin, cLam, bk);
      katsroh   = `${sub("فِعَالٌ", cFa, cAin, cLam, bk)} / ${sub("فُعُولٌ", cFa, cAin, cLam, bk)}`;
      muntahal  = "—";
      explanation = "Wazan فَعْلٌ (muannats: فَعْلَةٌ). Jamak: فِعَالٌ / فُعُولٌ.";
      break;
    default: {
      // فَعِيلٌ (default)
      mudzakkar = sub("فَعِيلٌ", cFa, cAin, cLam, bk);
      muannas   = sub("فَعِيلَةٌ", cFa, cAin, cLam, bk);
      if (bk === "mudaaf") {
        katsroh  = sub("أَفِعَّاءُ", cFa, cAin, cLam, bk);
        muntahal = sub("فَعَائِلُ", cFa, cAin, cLam, bk);
        explanation = "Wazan فَعِيلٌ bina Muda'af. Jamak: أَفِعَّاءُ, Muntahal: فَعَائِلُ.";
      } else if (bk === "ajwaf") {
        katsroh  = sub("فِعَالٌ", cFa, cAin, cLam, bk);
        muntahal = sub("فَعَائِلُ", cFa, cAin, cLam, bk);
        explanation = "Wazan فَعِيلٌ bina Ajwaf. Jamak: فِعَالٌ, Muntahal: فَعَائِلُ.";
      } else if (bk === "naqish" || bk === "lafif") {
        muannas  = sub("فَعِيَّةٌ", cFa, cAin, cLam, bk);
        katsroh  = sub("أَفْعِيَّاءُ", cFa, cAin, cLam, bk);
        muntahal = sub("فَعَايَا", cFa, cAin, cLam, bk);
        explanation = "Wazan فَعِيلٌ bina Naqis/Lafif. Jamak: أَفْعِيَّاءُ, Muntahal: فَعَايَا.";
      } else {
        katsroh  = `${sub("فُعَلَاءُ", cFa, cAin, cLam, bk)} / ${sub("فِعَالٌ", cFa, cAin, cLam, bk)} / ${sub("أَفْعِلَاءُ", cFa, cAin, cLam, bk)}`;
        muntahal = sub("فَعَائِلُ", cFa, cAin, cLam, bk);
        explanation = "Wazan فَعِيلٌ bina Shohih. Jamak: فُعَلَاءُ / فِعَالٌ / أَفْعِلَاءُ, Muntahal: فَعَائِلُ.";
      }
      break;
    }
  }

  return {
    mufrod_mudzakkar: mudzakkar,
    mufrod_muannas: muannas,
    katsroh,
    qillah: "—",
    muntahal,
    wazan_name: wazan,
    isQiyasi: !isSamai,
    isSamai,
    reference: "Lisanul 'Arab · Tajul 'Arus · Al-Shorof Al-Wadhih",
    explanation,
  };
}

export function analyzeSifatMusyabihatPlural(entry: DictionaryEntry): PluralSifatMusyabihat {
  const raw = entry.sifatMusyabihat || "";
  if (!raw || raw === "—") {
    return {
      mufrod_mudzakkar: "—", mufrod_muannas: "—", katsroh: "—",
      qillah: "—", muntahal: "—", wazan_name: "—", isQiyasi: false,
      isSamai: false, reference: "—", explanation: "Kata ini tidak memiliki Sifat Musyabihat.",
    };
  }

  const parts = raw.split(/[\/,]/).map(s => s.trim()).filter(s => s && s !== "/");
  if (parts.length <= 1) return analyzeSingle(entry, parts[0] || raw);

  const results = parts.map(s => analyzeSingle(entry, s));
  const pick = (arr: string[]) => arr.filter(x => x && x !== "—" && x !== "-.").join(" / ") || "—";

  return {
    mufrod_mudzakkar: pick(results.map(r => r.mufrod_mudzakkar)),
    mufrod_muannas:   pick(results.map(r => r.mufrod_muannas)),
    katsroh:          pick(results.map(r => r.katsroh)),
    qillah:           "—",
    muntahal:         pick(results.map(r => r.muntahal)),
    wazan_name:       results.map(r => r.wazan_name).filter(Boolean).join(" / "),
    isQiyasi:         results.some(r => r.isQiyasi),
    isSamai:          results.every(r => r.isSamai),
    reference:        results[0].reference,
    explanation:      "",
  };
}
