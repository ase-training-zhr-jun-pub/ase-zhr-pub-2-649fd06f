import { useState } from "react"
import { Filter, MapPin, SearchX } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SucheControls } from "@/components/suche-controls"
import { RaumCard } from "@/components/raum-card"
import { BuchungDialog } from "@/components/buchung-dialog"
import {
  ausstattungen,
  raeumeNachStandort,
  standortById,
  type AusstattungId,
  type Raum,
} from "@/lib/mock-data"
import { formatDatumKurz } from "@/lib/format"
import { useStandort } from "@/lib/standort-context"
import { useSuche } from "@/lib/suche-context"
import { useBuchungen } from "@/lib/buchungen-context"

export function Buchen() {
  const { standortId } = useStandort()
  const { datum, von, bis } = useSuche()
  const { istVerfuegbar } = useBuchungen()

  const [minKapazitaet, setMinKapazitaet] = useState(1)
  const [filterAusstattung, setFilterAusstattung] = useState<Set<AusstattungId>>(
    new Set(),
  )
  const [dialogRaum, setDialogRaum] = useState<Raum | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [ausgewaehlterRaumId, setAusgewaehlterRaumId] = useState<string | null>(null)

  const standort = standortById(standortId)

  const toggleAusstattung = (id: AusstattungId) =>
    setFilterAusstattung((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const gefiltert = raeumeNachStandort(standortId)
    .filter((r) => r.kapazitaet >= minKapazitaet)
    .filter((r) => [...filterAusstattung].every((a) => r.ausstattung.includes(a)))
    .sort((a, b) => {
      const aFrei = istVerfuegbar(a.id, datum, von, bis) ? 0 : 1
      const bFrei = istVerfuegbar(b.id, datum, von, bis) ? 0 : 1
      return aFrei - bFrei || a.kapazitaet - b.kapazitaet
    })

  const freieAnzahl = gefiltert.filter((r) =>
    istVerfuegbar(r.id, datum, von, bis),
  ).length

  const handleBuchen = (raum: Raum) => {
    setDialogRaum(raum)
    setAusgewaehlterRaumId(raum.id)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setAusgewaehlterRaumId(null)
  }

  const filterAktiv = minKapazitaet > 1 || filterAusstattung.size > 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Raum buchen</h1>
        <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4" />
          {standort?.name} · {formatDatumKurz(datum)} · {von}–{bis} Uhr
        </p>
      </div>

      {/* Suchleiste */}
      <Card>
        <CardContent className="py-4">
          <SucheControls />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Filter */}
        <aside className="space-y-5">
          <div className="flex items-center gap-2 font-medium">
            <Filter className="size-4" />
            Filter
          </div>

          <div className="space-y-2">
            <Label htmlFor="kapazitaet">Mindestens Teilnehmer</Label>
            <Input
              id="kapazitaet"
              type="number"
              min={1}
              max={20}
              value={minKapazitaet}
              onChange={(e) =>
                setMinKapazitaet(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>

          <Separator />

          <div className="space-y-2.5">
            <Label>Ausstattung</Label>
            {ausstattungen.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={filterAusstattung.has(a.id)}
                  onCheckedChange={() => toggleAusstattung(a.id)}
                />
                {a.label}
              </label>
            ))}
          </div>

          {filterAktiv && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMinKapazitaet(1)
                setFilterAusstattung(new Set())
              }}
            >
              Filter zurücksetzen
            </Button>
          )}
        </aside>

        {/* Ergebnisliste */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{freieAnzahl}</span>{" "}
              von {gefiltert.length} Räumen im gewählten Zeitfenster frei
            </p>
            {filterAktiv && <Badge variant="secondary">Gefiltert</Badge>}
          </div>

          {gefiltert.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <SearchX className="size-8" />
                <p>Keine Räume entsprechen den Filtern.</p>
                <p className="text-sm">
                  Passe die Filter an oder wähle einen anderen Standort.
                </p>
              </CardContent>
            </Card>
          ) : (
            gefiltert.map((raum) => (
              <RaumCard key={raum.id} raum={raum} onBuchen={handleBuchen} isSelected={ausgewaehlterRaumId === raum.id} />
            ))
          )}
        </div>
      </div>

      <BuchungDialog
        raum={dialogRaum}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  )
}
