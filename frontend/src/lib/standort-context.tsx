import { createContext, useContext, useState, type ReactNode } from "react"

import { aktuellerNutzer } from "@/lib/mock-data"

interface StandortContextValue {
  standortId: string
  setStandortId: (id: string) => void
}

const StandortContext = createContext<StandortContextValue | undefined>(undefined)

export function StandortProvider({ children }: { children: ReactNode }) {
  const [standortId, setStandortId] = useState(aktuellerNutzer.standortId)
  return (
    <StandortContext.Provider value={{ standortId, setStandortId }}>
      {children}
    </StandortContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStandort() {
  const ctx = useContext(StandortContext)
  if (!ctx) throw new Error("useStandort muss innerhalb von StandortProvider genutzt werden")
  return ctx
}
