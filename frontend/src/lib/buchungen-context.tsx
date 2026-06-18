import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { aktuellerNutzer, ueberlappt, type Buchung } from "@/lib/mock-data"

export interface NeueBuchung {
  raumId: string
  titel: string
  notiz?: string
  datum: string
  von: string
  bis: string
}

interface BuchungenContextValue {
  buchungen: Buchung[]
  /** Eigene, bestätigte Buchungen. */
  eigene: Buchung[]
  /** Bestätigte Belegungen eines Raums an einem Datum. */
  belegungen: (raumId: string, datum: string) => Buchung[]
  /** Ist der Raum am Datum im Zeitfenster frei? */
  istVerfuegbar: (raumId: string, datum: string, von: string, bis: string) => boolean
  addBuchung: (b: NeueBuchung) => Promise<Buchung>
  stornieren: (id: string) => Promise<void>
  aendern: (id: string, patch: Partial<NeueBuchung>) => Promise<void>
}

const BuchungenContext = createContext<BuchungenContextValue | undefined>(undefined)

export function BuchungenProvider({ children }: { children: ReactNode }) {
  const [buchungen, setBuchungen] = useState<Buchung[]>([])

  useEffect(() => {
    fetch("api/buchungen")
      .then((r) => r.json())
      .then((data: Buchung[]) => setBuchungen(data))
      .catch(() => {/* Backend nicht erreichbar — leere Liste */})
  }, [])

  const belegungen = useCallback(
    (raumId: string, datum: string) =>
      buchungen.filter(
        (b) => b.raumId === raumId && b.datum === datum && b.status === "bestaetigt",
      ),
    [buchungen],
  )

  const value = useMemo<BuchungenContextValue>(
    () => ({
      buchungen,
      eigene: buchungen.filter(
        (b) => b.nutzerId === aktuellerNutzer.id && b.status === "bestaetigt",
      ),
      belegungen,
      istVerfuegbar: (raumId, datum, von, bis) =>
        !belegungen(raumId, datum).some((b) => ueberlappt(von, bis, b.von, b.bis)),

      addBuchung: async (b) => {
        const res = await fetch("api/buchungen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...b, nutzerId: aktuellerNutzer.id }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.fehler ?? "Buchung fehlgeschlagen.")
        }
        const neu: Buchung = await res.json()
        setBuchungen((prev) => [...prev, neu])
        return neu
      },

      stornieren: async (id) => {
        await fetch(`api/buchungen/${id}`, { method: "DELETE" })
        setBuchungen((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "storniert" } : b)),
        )
      },

      aendern: async (id, patch) => {
        const res = await fetch(`api/buchungen/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.fehler ?? "Änderung fehlgeschlagen.")
        }
        const aktualisiert: Buchung = await res.json()
        setBuchungen((prev) =>
          prev.map((b) => (b.id === id ? aktualisiert : b)),
        )
      },
    }),
    [buchungen, belegungen],
  )

  return (
    <BuchungenContext.Provider value={value}>{children}</BuchungenContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBuchungen() {
  const ctx = useContext(BuchungenContext)
  if (!ctx)
    throw new Error("useBuchungen muss innerhalb von BuchungenProvider genutzt werden")
  return ctx
}
