export interface DataWazan {
  name?: string;
  type?: string;
  description?: string;
  fa?: string;
  ain?: string;
  lam?: string;
  wazanMadhi?: string;
  wazanMudhari?: string;
  masdar?: string;
  sifatMusyabihat?: string;
  babNum?: number;
}

export interface ShighotDetail {
  label?: string;
  value?: string;
  mufrod?: string;
  jamak?: string[];
  muntahal?: string[];
  [key: string]: any;
}

export interface TasrifIstilahi {
  madhi?: string;
  mudhari?: string;
  masdar?: string;
  isimFail?: string;
  isimMaful?: string;
  amr?: string;
  nahi?: string;
  isimZamanMakan?: string;
  isimAlat?: string;
  sifatMusyabihat?: string;
}

export interface TasrifLughowi {
  rows?: TasrifLughowiRow[];
}

export interface DictionaryEntry {
  id: string;
  root: { fa: string; ain: string; lam: string };
  babNum: 1 | 2 | 3 | 4 | 5 | 6;
  translation: string;
  bina: string;
  asal?: string;
  madhi?: string;
  mudhari?: string;
  masdar?: string;
  masdarSamai?: string;
  masdarQiyasi?: string;
  isimFail?: string;
  isimMaful?: string;
  amr?: string;
  nahi?: string;
  isimZamanMakan?: string;
  sifatMusyabihat?: string;
  sifatMusyabihatPlural?: {
    mufrodMudzakkar?: string;
    mufrod_mudzakkar?: string;
    mufrodMuannas?: string;
    mufrod_muannas?: string;
    katsroh?: string;
    qillah?: string;
    muntahal?: string;
    wazanName?: string;
    wazan_name?: string;
    isQiyasi?: boolean;
    isSamai?: boolean;
    reference?: string;
    explanation?: string;
  };
  explanation?: string;
  notes?: string;
  isLazim?: boolean;
  jamaTaksirSamai?: string;
  [key: string]: any;
}

export interface TasrifIstilahiData {
  madhi: string;
  mudhari: string;
  masdar: string;
  isimFail: string;
  isimMaful: string;
  amr: string;
  nahi: string;
  isimZamanMakan: string;
  isimAlat: string;
  sifatMusyabihat: string;
}

export interface TasrifLughowiRow {
  dhamir: string;
  dhamirAr: string;
  form: string;
}

export interface PluralIsimFail {
  qillah: string;
  katsroh: string;
  muntahal: string;
  reference: string;
  explanation: string;
}

export interface PluralIsimMaful {
  qillah: string;
  katsroh: string;
  muntahal: string;
  reference: string;
  explanation: string;
}

export interface PluralIsimZamanMakan {
  mufrod: string;
  qillah: string;
  katsroh: string;
  muntahal: string;
  reference: string;
  explanation: string;
}

export interface PluralIsimAlat {
  mufrod: string;
  qillah: string;
  katsroh: string;
  muntahal: string;
  reference: string;
  explanation: string;
}

export interface PluralSifatMusyabihat {
  mufrodMudzakkar: string;
  mufrodMuannas: string;
  katsroh: string;
  qillah: string;
  muntahal: string;
  wazanName: string;
  isQiyasi: boolean;
  isSamai: boolean;
  reference: string;
  explanation: string;
}

export interface ThemeColors {
  bg: string;
  textColor: string;
  header: string;
  headerText: string;
  subText: string;
  card: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  border: string;
  cardInner: string;
  cardInnerBorder: string;
  tabBtnActive: string;
  tabBtnActiveText: string;
  tabBtnInactiveText: string;
  accentText: string;
  highlightTitle: string;
  presetBtnSelBg: string;
  presetBtnSelBorder: string;
  presetBtnSelText: string;
  presetBtnNorBg: string;
  presetBtnNorBorder: string;
  presetBtnNorText: string;
  groupHeaderTitle: string;
  textLabel: string;
  profileBg: string;
  profileBorder: string;
}

export type AppTheme = 'dark' | 'light' | 'green';
export type TabType = 'istilahi' | 'lughowi' | 'masdar' | 'sifat' | 'jama' | 'iilal';
export type JamakTabType = 'fail' | 'maful' | 'zamanmakan' | 'alat';
