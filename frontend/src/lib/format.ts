// Formatierungs-Helfer für deutsche Datums-/Zeitangaben.

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const WOCHENTAGE_LANG = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
]
const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
]

/** Parst "YYYY-MM-DD" als lokales Datum (ohne Zeitzonen-Verschiebung). */
export const parseDatum = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** "2026-06-23" -> "Di, 23. Juni 2026" */
export const formatDatumLang = (iso: string): string => {
  const dt = parseDatum(iso)
  return `${WOCHENTAGE[dt.getDay()]}, ${dt.getDate()}. ${MONATE[dt.getMonth()]} ${dt.getFullYear()}`
}

/** "2026-06-23" -> "Di, 23.06." */
export const formatDatumKurz = (iso: string): string => {
  const dt = parseDatum(iso)
  const tag = String(dt.getDate()).padStart(2, "0")
  const monat = String(dt.getMonth() + 1).padStart(2, "0")
  return `${WOCHENTAGE[dt.getDay()]}, ${tag}.${monat}.`
}

/** "2026-06-23" -> "Dienstag" */
export const formatWochentag = (iso: string): string =>
  WOCHENTAGE_LANG[parseDatum(iso).getDay()]

/** Dauer zwischen "09:00" und "10:30" als "1,5 h" / "30 min". */
export const formatDauer = (von: string, bis: string): string => {
  const [vh, vm] = von.split(":").map(Number)
  const [bh, bm] = bis.split(":").map(Number)
  const min = bh * 60 + bm - (vh * 60 + vm)
  if (min < 60) return `${min} min`
  const h = min / 60
  return `${h.toLocaleString("de-DE")} h`
}

/** Heutiges Datum im Prototyp (statisch gemockt: 2026-06-17). */
export const HEUTE = "2026-06-17"

/** Liegt das Datum (mit Endzeit) in der Zukunft relativ zu HEUTE? */
export const istZukunft = (iso: string): boolean => iso >= HEUTE
