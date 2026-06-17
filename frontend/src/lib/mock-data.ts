// Zentrale Mock-Daten für den Calvin-Prototyp.
// Kein Backend — alle Daten werden hier gemockt.

// ---------------------------------------------------------------------------
// Standorte (alle 8 INNOQ-Standorte)
// ---------------------------------------------------------------------------

export interface Standort {
  id: string
  name: string
  land: "DE" | "CH"
  adresse: string
}

export const standorte: Standort[] = [
  { id: "monheim", name: "Monheim", land: "DE", adresse: "Krischerstraße 100" },
  { id: "berlin", name: "Berlin", land: "DE", adresse: "Ohlauer Straße 43" },
  { id: "hamburg", name: "Hamburg", land: "DE", adresse: "Ludwig-Erhard-Straße 18" },
  { id: "koeln", name: "Köln", land: "DE", adresse: "Hohenzollernring 72" },
  { id: "muenchen", name: "München", land: "DE", adresse: "Balanstraße 73" },
  { id: "zuerich", name: "Zürich", land: "CH", adresse: "Förrlibuckstrasse 110" },
  { id: "baar", name: "Baar", land: "CH", adresse: "Zugerstrasse 76b" },
  { id: "offenbach", name: "Offenbach", land: "DE", adresse: "Kaiserstraße 39" },
]

// ---------------------------------------------------------------------------
// Ausstattung
// ---------------------------------------------------------------------------

export type AusstattungId =
  | "screen"
  | "vc"
  | "whiteboard"
  | "telefonbox"
  | "flipchart"
  | "barrierefrei"

export interface Ausstattung {
  id: AusstattungId
  label: string
}

export const ausstattungen: Ausstattung[] = [
  { id: "screen", label: "Bildschirm" },
  { id: "vc", label: "Videokonferenz" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "flipchart", label: "Flipchart" },
  { id: "telefonbox", label: "Telefonbox" },
  { id: "barrierefrei", label: "Barrierefrei" },
]

export const ausstattungLabel = (id: AusstattungId): string =>
  ausstattungen.find((a) => a.id === id)?.label ?? id

// ---------------------------------------------------------------------------
// Konferenzräume
// ---------------------------------------------------------------------------

export interface Raum {
  id: string
  name: string
  standortId: string
  kapazitaet: number
  etage: string
  ausstattung: AusstattungId[]
  beschreibung: string
}

// Räume sind nach Informatik-Pionier:innen benannt.
export const raeume: Raum[] = [
  // Köln
  {
    id: "koeln-dijkstra",
    name: "Dijkstra",
    standortId: "koeln",
    kapazitaet: 12,
    etage: "3. OG",
    ausstattung: ["screen", "vc", "whiteboard", "flipchart"],
    beschreibung:
      "Großer Workshop-Raum mit flexibler Bestuhlung, ideal für Kundenworkshops.",
  },
  {
    id: "koeln-turing",
    name: "Turing",
    standortId: "koeln",
    kapazitaet: 6,
    etage: "3. OG",
    ausstattung: ["screen", "vc", "whiteboard"],
    beschreibung: "Kompakter Besprechungsraum für Teammeetings.",
  },
  {
    id: "koeln-lovelace",
    name: "Lovelace",
    standortId: "koeln",
    kapazitaet: 4,
    etage: "2. OG",
    ausstattung: ["screen", "vc"],
    beschreibung: "Heller Raum für fokussierte Vier-Augen-Gespräche.",
  },
  {
    id: "koeln-hopper",
    name: "Hopper",
    standortId: "koeln",
    kapazitaet: 8,
    etage: "2. OG",
    ausstattung: ["screen", "vc", "whiteboard", "barrierefrei"],
    beschreibung: "Barrierefreier Meetingraum mit großem Bildschirm.",
  },
  {
    id: "koeln-box-1",
    name: "Telefonbox 1",
    standortId: "koeln",
    kapazitaet: 1,
    etage: "2. OG",
    ausstattung: ["telefonbox", "vc"],
    beschreibung: "Schallisolierte Box für ungestörte Remote-Calls.",
  },
  // Berlin
  {
    id: "berlin-zuse",
    name: "Zuse",
    standortId: "berlin",
    kapazitaet: 10,
    etage: "4. OG",
    ausstattung: ["screen", "vc", "whiteboard", "flipchart"],
    beschreibung: "Großzügiger Konferenzraum mit Blick über Kreuzberg.",
  },
  {
    id: "berlin-neumann",
    name: "von Neumann",
    standortId: "berlin",
    kapazitaet: 6,
    etage: "4. OG",
    ausstattung: ["screen", "vc", "whiteboard"],
    beschreibung: "Besprechungsraum für agile Team-Sessions.",
  },
  {
    id: "berlin-knuth",
    name: "Knuth",
    standortId: "berlin",
    kapazitaet: 4,
    etage: "3. OG",
    ausstattung: ["screen", "vc"],
    beschreibung: "Ruhiger Raum für Reviews und Pairings.",
  },
  {
    id: "berlin-box-1",
    name: "Telefonbox A",
    standortId: "berlin",
    kapazitaet: 1,
    etage: "4. OG",
    ausstattung: ["telefonbox", "vc"],
    beschreibung: "Telefonbox direkt am Teambereich.",
  },
  // Hamburg
  {
    id: "hamburg-liskov",
    name: "Liskov",
    standortId: "hamburg",
    kapazitaet: 8,
    etage: "5. OG",
    ausstattung: ["screen", "vc", "whiteboard"],
    beschreibung: "Meetingraum mit Hafenblick.",
  },
  {
    id: "hamburg-ritchie",
    name: "Ritchie",
    standortId: "hamburg",
    kapazitaet: 14,
    etage: "5. OG",
    ausstattung: ["screen", "vc", "whiteboard", "flipchart", "barrierefrei"],
    beschreibung: "Großer Schulungsraum für Workshops und Vorträge.",
  },
  {
    id: "hamburg-perlis",
    name: "Perlis",
    standortId: "hamburg",
    kapazitaet: 4,
    etage: "4. OG",
    ausstattung: ["screen", "vc"],
    beschreibung: "Kleiner Besprechungsraum für spontane Abstimmungen.",
  },
  // München
  {
    id: "muenchen-wirth",
    name: "Wirth",
    standortId: "muenchen",
    kapazitaet: 10,
    etage: "2. OG",
    ausstattung: ["screen", "vc", "whiteboard", "flipchart"],
    beschreibung: "Workshop-Raum mit modularer Möblierung.",
  },
  {
    id: "muenchen-kay",
    name: "Kay",
    standortId: "muenchen",
    kapazitaet: 6,
    etage: "2. OG",
    ausstattung: ["screen", "vc", "whiteboard"],
    beschreibung: "Besprechungsraum für Projektteams.",
  },
  // Zürich
  {
    id: "zuerich-hamilton",
    name: "Hamilton",
    standortId: "zuerich",
    kapazitaet: 8,
    etage: "1. OG",
    ausstattung: ["screen", "vc", "whiteboard", "barrierefrei"],
    beschreibung: "Barrierefreier Konferenzraum mit Videokonferenz-Equipment.",
  },
  {
    id: "zuerich-clarke",
    name: "Clarke",
    standortId: "zuerich",
    kapazitaet: 5,
    etage: "1. OG",
    ausstattung: ["screen", "vc"],
    beschreibung: "Heller Raum für Vier-Augen-Gespräche und Reviews.",
  },
  // Baar
  {
    id: "baar-engelbart",
    name: "Engelbart",
    standortId: "baar",
    kapazitaet: 12,
    etage: "EG",
    ausstattung: ["screen", "vc", "whiteboard", "flipchart"],
    beschreibung: "Großer Raum für Kunden-Workshops in Baar.",
  },
  // Monheim
  {
    id: "monheim-torvalds",
    name: "Torvalds",
    standortId: "monheim",
    kapazitaet: 16,
    etage: "1. OG",
    ausstattung: ["screen", "vc", "whiteboard", "flipchart", "barrierefrei"],
    beschreibung: "Größter Raum am Standort, für All-Hands und Trainings.",
  },
  {
    id: "monheim-allen",
    name: "Allen",
    standortId: "monheim",
    kapazitaet: 6,
    etage: "1. OG",
    ausstattung: ["screen", "vc", "whiteboard"],
    beschreibung: "Besprechungsraum für Teamtermine.",
  },
  // Offenbach
  {
    id: "offenbach-goldberg",
    name: "Goldberg",
    standortId: "offenbach",
    kapazitaet: 8,
    etage: "3. OG",
    ausstattung: ["screen", "vc", "whiteboard"],
    beschreibung: "Meetingraum im Offenbacher Büro.",
  },
]

export const raeumeNachStandort = (standortId: string): Raum[] =>
  raeume.filter((r) => r.standortId === standortId)

export const raumById = (id: string): Raum | undefined =>
  raeume.find((r) => r.id === id)

export const standortById = (id: string): Standort | undefined =>
  standorte.find((s) => s.id === id)

// ---------------------------------------------------------------------------
// Nutzer (eingeloggt)
// ---------------------------------------------------------------------------

export interface Nutzer {
  id: string
  name: string
  initialen: string
  rolle: string
  standortId: string
}

export const aktuellerNutzer: Nutzer = {
  id: "alex",
  name: "Alex Berger",
  initialen: "AB",
  rolle: "Senior Consultant",
  standortId: "koeln",
}

// ---------------------------------------------------------------------------
// Buchungen
// ---------------------------------------------------------------------------

export type BuchungStatus = "bestaetigt" | "storniert"

export interface Buchung {
  id: string
  raumId: string
  titel: string
  notiz?: string
  /** ISO-Datum, z. B. "2026-06-23" */
  datum: string
  /** "HH:MM" */
  von: string
  bis: string
  nutzerId: string
  status: BuchungStatus
}

// Hinweis: Datumswerte sind statisch gemockt (Bezug heute = 2026-06-17).
export const buchungen: Buchung[] = [
  // Eigene, anstehende Buchungen von Alex
  {
    id: "b-1001",
    raumId: "koeln-dijkstra",
    titel: "Kundenworkshop Versicherungsplattform",
    notiz: "Bitte Bestuhlung U-Form, Catering ist bestellt.",
    datum: "2026-06-23",
    von: "09:00",
    bis: "12:00",
    nutzerId: "alex",
    status: "bestaetigt",
  },
  {
    id: "b-1002",
    raumId: "koeln-box-1",
    titel: "Kunden-Call Statusupdate",
    datum: "2026-06-23",
    von: "14:00",
    bis: "14:30",
    nutzerId: "alex",
    status: "bestaetigt",
  },
  {
    id: "b-1003",
    raumId: "koeln-turing",
    titel: "Team-Retro Projekt Phoenix",
    notiz: "Whiteboard für Retro-Board freihalten.",
    datum: "2026-06-30",
    von: "10:00",
    bis: "11:30",
    nutzerId: "alex",
    status: "bestaetigt",
  },
  // Eigene, vergangene Buchung
  {
    id: "b-1000",
    raumId: "koeln-lovelace",
    titel: "1:1 mit Teamlead",
    datum: "2026-06-10",
    von: "15:00",
    bis: "15:30",
    nutzerId: "alex",
    status: "bestaetigt",
  },
  // Fremdbuchungen (für Verfügbarkeits-/Belegungslogik)
  {
    id: "b-2001",
    raumId: "koeln-dijkstra",
    titel: "Architektur-Review",
    datum: "2026-06-23",
    von: "13:00",
    bis: "15:00",
    nutzerId: "carla",
    status: "bestaetigt",
  },
  {
    id: "b-2002",
    raumId: "koeln-turing",
    titel: "Sprint Planning",
    datum: "2026-06-23",
    von: "09:00",
    bis: "09:30",
    nutzerId: "milan",
    status: "bestaetigt",
  },
  {
    id: "b-2003",
    raumId: "koeln-turing",
    titel: "Design-Abstimmung",
    datum: "2026-06-23",
    von: "11:00",
    bis: "12:00",
    nutzerId: "milan",
    status: "bestaetigt",
  },
  {
    id: "b-2004",
    raumId: "koeln-hopper",
    titel: "Onboarding neue Kolleg:innen",
    datum: "2026-06-23",
    von: "09:00",
    bis: "17:00",
    nutzerId: "sven",
    status: "bestaetigt",
  },
  {
    id: "b-2005",
    raumId: "koeln-lovelace",
    titel: "Pairing Session",
    datum: "2026-06-23",
    von: "10:00",
    bis: "11:00",
    nutzerId: "nora",
    status: "bestaetigt",
  },
]

export const eigeneBuchungen = (): Buchung[] =>
  buchungen.filter(
    (b) => b.nutzerId === aktuellerNutzer.id && b.status === "bestaetigt",
  )

// Belegungen eines Raums an einem Datum (für Verfügbarkeitsprüfung).
export const belegungen = (raumId: string, datum: string): Buchung[] =>
  buchungen.filter(
    (b) =>
      b.raumId === raumId && b.datum === datum && b.status === "bestaetigt",
  )

// ---------------------------------------------------------------------------
// Verfügbarkeits-Helfer
// ---------------------------------------------------------------------------

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export const ueberlappt = (
  aVon: string,
  aBis: string,
  bVon: string,
  bBis: string,
): boolean => toMin(aVon) < toMin(bBis) && toMin(bVon) < toMin(aBis)

/** Ist der Raum am Datum im Zeitfenster frei? */
export const istVerfuegbar = (
  raumId: string,
  datum: string,
  von: string,
  bis: string,
): boolean =>
  !belegungen(raumId, datum).some((b) => ueberlappt(von, bis, b.von, b.bis))

// Tageszeitraster für Belegungsanzeige (Bürozeiten 8–19 Uhr).
export const STUNDEN: number[] = Array.from({ length: 11 }, (_, i) => 8 + i)
