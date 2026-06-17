import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import {
  aktuellerNutzer,
  buchungen as initialeBuchungen,
  ueberlappt,
  type Buchung,
} from "@/lib/mock-data"

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
  addBuchung: (b: NeueBuchung) => Buchung
  stornieren: (id: string) => void
  aendern: (id: string, patch: Partial<NeueBuchung>) => void
}

const BuchungenContext = createContext<BuchungenContextValue | undefined>(undefined)

let counter = 9000

export function BuchungenProvider({ children }: { children: ReactNode }) {
  const [buchungen, setBuchungen] = useState<Buchung[]>(initialeBuchungen)

  const value = useMemo<BuchungenContextValue>(() => {
    const belegungen = (raumId: string, datum: string) =>
      buchungen.filter(
        (b) =>
          b.raumId === raumId &&
          b.datum === datum &&
          b.status === "bestaetigt",
      )

    return {
      buchungen,
      eigene: buchungen.filter(
        (b) => b.nutzerId === aktuellerNutzer.id && b.status === "bestaetigt",
      ),
      belegungen,
      istVerfuegbar: (raumId, datum, von, bis) =>
        !belegungen(raumId, datum).some((b) => ueberlappt(von, bis, b.von, b.bis)),
      addBuchung: (b) => {
        const neu: Buchung = {
          id: `b-${++counter}`,
          nutzerId: aktuellerNutzer.id,
          status: "bestaetigt",
          ...b,
        }
        setBuchungen((prev) => [...prev, neu])
        return neu
      },
      stornieren: (id) =>
        setBuchungen((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, status: "storniert" } : b,
          ),
        ),
      aendern: (id, patch) =>
        setBuchungen((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        ),
    }
  }, [buchungen])

  return (
    <BuchungenContext.Provider value={value}>
      {children}
    </BuchungenContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBuchungen() {
  const ctx = useContext(BuchungenContext)
  if (!ctx)
    throw new Error("useBuchungen muss innerhalb von BuchungenProvider genutzt werden")
  return ctx
}
