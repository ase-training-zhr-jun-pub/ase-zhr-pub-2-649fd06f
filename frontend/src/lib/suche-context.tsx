import { createContext, useContext, useState, type ReactNode } from "react"

export interface Suche {
  datum: string
  von: string
  bis: string
}

interface SucheContextValue extends Suche {
  setSuche: (s: Partial<Suche>) => void
}

// Default: nächster typischer Bürotag (Di) mit Vormittags-Slot.
const DEFAULT: Suche = {
  datum: "2026-06-23",
  von: "09:00",
  bis: "10:00",
}

const SucheContext = createContext<SucheContextValue | undefined>(undefined)

export function SucheProvider({ children }: { children: ReactNode }) {
  const [suche, setSucheState] = useState<Suche>(DEFAULT)
  const setSuche = (s: Partial<Suche>) =>
    setSucheState((prev) => ({ ...prev, ...s }))
  return (
    <SucheContext.Provider value={{ ...suche, setSuche }}>
      {children}
    </SucheContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSuche() {
  const ctx = useContext(SucheContext)
  if (!ctx) throw new Error("useSuche muss innerhalb von SucheProvider genutzt werden")
  return ctx
}
