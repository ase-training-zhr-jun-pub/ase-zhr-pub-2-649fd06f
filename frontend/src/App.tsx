import { HashRouter, Route, Routes } from "react-router-dom"

import { Layout } from "@/components/layout"
import { StandortProvider } from "@/lib/standort-context"
import { SucheProvider } from "@/lib/suche-context"
import { BuchungenProvider } from "@/lib/buchungen-context"
import { Toaster } from "@/components/ui/sonner"
import { Dashboard } from "@/pages/Dashboard"
import { Buchen } from "@/pages/Buchen"
import { MeineBuchungen } from "@/pages/MeineBuchungen"

function App() {
  return (
    <BuchungenProvider>
      <StandortProvider>
        <SucheProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/buchen" element={<Buchen />} />
                <Route path="/buchungen" element={<MeineBuchungen />} />
              </Route>
            </Routes>
          </HashRouter>
          <Toaster />
        </SucheProvider>
      </StandortProvider>
    </BuchungenProvider>
  )
}

export default App
