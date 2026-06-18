import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, CalendarCheck, Clock, MapPin, Users } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AusstattungBadge } from "@/components/ausstattung-badges"
import { standortById, ueberlappt, type Buchung, type Raum } from "@/lib/mock-data"
import { formatDatumLang, formatDauer } from "@/lib/format"
import { useSuche } from "@/lib/suche-context"
import { useBuchungen } from "@/lib/buchungen-context"
import { ZEITEN } from "@/components/suche-controls"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Hilfsfunktion: freie Alternativen zum gewünschten Zeitfenster finden (CLVN-012)
// ---------------------------------------------------------------------------

/**
 * Sucht bis zu 3 freie [von, bis]-Paare mit gleicher Dauer wie das Wunsch-
 * fenster, sortiert nach zeitlicher Nähe zum Wunschtermin.
 */
export function findeAlternativen(
  raumId: string,
  datum: string,
  von: string,
  bis: string,
  belegungen: (raumId: string, datum: string) => Buchung[],
): [string, string][] {
  const toMin = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
  }
  const toHHMM = (min: number): string => {
    const h = String(Math.floor(min / 60)).padStart(2, "0")
    const m = String(min % 60).padStart(2, "0")
    return `${h}:${m}`
  }

  const dauer = toMin(bis) - toMin(von)
  const wunschVon = toMin(von)
  const belegt = belegungen(raumId, datum)

  // Alle möglichen Startzeiten aus ZEITEN, bei denen das Endfenster noch in Bürozeiten liegt
  const kandidaten: [string, string][] = ZEITEN.filter((start) => {
    const startMin = toMin(start)
    const endMin = startMin + dauer
    const endStr = toHHMM(endMin)
    return (
      endMin <= 19 * 60 &&
      endMin > startMin &&
      (ZEITEN.includes(endStr) || endStr === "19:00")
    )
  }).map((start) => [start, toHHMM(toMin(start) + dauer)])

  // Nur freie Slots (ohne den Wunschslot selbst)
  const frei = kandidaten.filter(([kVon, kBis]) => {
    if (kVon === von && kBis === bis) return false
    return !belegt.some((b) => ueberlappt(kVon, kBis, b.von, b.bis))
  })

  // Sortieren nach Nähe zum Wunschtermin
  frei.sort(([aVon], [bVon]) => {
    const distA = Math.abs(toMin(aVon) - wunschVon)
    const distB = Math.abs(toMin(bVon) - wunschVon)
    return distA - distB
  })

  return frei.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Zeitslot-Raster Komponente (CLVN-011)
// ---------------------------------------------------------------------------

interface ZeitslotRasterProps {
  raumId: string
  datum: string
  von: string
  bis: string
  belegungen: Buchung[]
  onSlotKlick?: (von: string, bis: string) => void
}

function ZeitslotRaster({
  datum: _datum,
  von,
  bis,
  belegungen,
  onSlotKlick,
}: ZeitslotRasterProps) {
  const toMin = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Belegung am {_datum}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1">
        {ZEITEN.map((slotVon) => {
          const slotVonMin = toMin(slotVon)
          const slotBisMin = slotVonMin + 30
          const slotBisH = String(Math.floor(slotBisMin / 60)).padStart(2, "0")
          const slotBisM = String(slotBisMin % 60).padStart(2, "0")
          const slotBis = `${slotBisH}:${slotBisM}`

          const istBelegt = belegungen.some((b) =>
            ueberlappt(slotVon, slotBis, b.von, b.bis),
          )

          const ausgewaehltVonMin = toMin(von)
          const ausgewaehltBisMin = toMin(bis)
          const istAusgewaehlt =
            slotVonMin >= ausgewaehltVonMin && slotBisMin <= ausgewaehltBisMin

          return (
            <button
              key={slotVon}
              type="button"
              disabled={istBelegt}
              onClick={() => {
                if (!istBelegt && onSlotKlick) {
                  onSlotKlick(slotVon, slotBis)
                }
              }}
              title={istBelegt ? `Belegt ${slotVon}–${slotBis}` : `Frei ${slotVon}–${slotBis}`}
              className={cn(
                "rounded px-1.5 py-1 text-[10px] font-medium leading-tight transition-colors",
                istBelegt
                  ? "cursor-not-allowed bg-[repeating-linear-gradient(45deg,hsl(var(--muted))_0px,hsl(var(--muted))_4px,hsl(var(--muted-foreground)/0.15)_4px,hsl(var(--muted-foreground)/0.15)_8px)] text-muted-foreground/50"
                  : istAusgewaehlt
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-foreground hover:bg-muted",
              )}
            >
              {slotVon}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded bg-muted/60" />
          Frei
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded bg-[repeating-linear-gradient(45deg,hsl(var(--muted))_0px,hsl(var(--muted))_2px,hsl(var(--muted-foreground)/0.15)_2px,hsl(var(--muted-foreground)/0.15)_4px)]" />
          Belegt
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded bg-primary" />
          Ausgewählt
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

interface BuchungDialogProps {
  raum: Raum | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGebucht?: () => void
}

export function BuchungDialog({
  raum,
  open,
  onOpenChange,
  onGebucht,
}: BuchungDialogProps) {
  const { datum, von: sucheVon, bis: sucheBis } = useSuche()
  const { addBuchung, belegungen, istVerfuegbar } = useBuchungen()
  const [schritt, setSchritt] = useState<1 | 2>(1)
  const [titel, setTitel] = useState("")
  const [notiz, setNotiz] = useState("")
  const [versucht, setVersucht] = useState(false)

  // Lokaler Von/Bis-Zustand, damit Slotklicks und Alternativklicks den Dialog aktualisieren
  const [von, setVon] = useState(sucheVon)
  const [bis, setBis] = useState(sucheBis)

  useEffect(() => {
    if (open) {
      setSchritt(1)
      setTitel("")
      setNotiz("")
      setVersucht(false)
      setVon(sucheVon)
      setBis(sucheBis)
    }
  }, [open, raum?.id, sucheVon, sucheBis])

  if (!raum) return null
  const ort = standortById(raum.standortId)
  const titelFehlt = titel.trim() === ""

  const raumBelegungen = belegungen(raum.id, datum)
  const slotVerfuegbar = istVerfuegbar(raum.id, datum, von, bis)
  const alternativen = slotVerfuegbar
    ? []
    : findeAlternativen(raum.id, datum, von, bis, belegungen)

  const handleBuchen = async () => {
    setVersucht(true)
    if (titelFehlt) return
    try {
      await addBuchung({ raumId: raum.id, titel: titel.trim(), notiz: notiz.trim() || undefined, datum, von, bis })
      onOpenChange(false)
      toast.success("Raum gebucht", {
        description: `${raum.name} · ${formatDatumLang(datum)} · ${von}–${bis} Uhr`,
      })
      onGebucht?.()
    } catch (e) {
      toast.error("Buchung fehlgeschlagen", { description: e instanceof Error ? e.message : undefined })
    }
  }

  const raumZusammenfassung = (
    <div className="rounded-lg border bg-muted/40 p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">{raum.name}</span>
        <Badge variant="secondary" className="gap-1">
          <Users className="size-3.5" />
          bis {raum.kapazitaet} Pers.
        </Badge>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="size-3.5" />
        {ort?.name} · {raum.etage}
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="size-3.5" />
        {formatDatumLang(datum)} · {von}–{bis} Uhr ({formatDauer(von, bis)})
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {raum.ausstattung.map((a) => (
          <AusstattungBadge key={a} id={a} />
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {schritt === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Raum auswählen
              </DialogTitle>
              <DialogDescription>
                Prüfe die Raumdetails und bestätige deine Auswahl.
              </DialogDescription>
            </DialogHeader>

            {raumZusammenfassung}

            {/* CLVN-011: Zeitslot-Raster */}
            <ZeitslotRaster
              raumId={raum.id}
              datum={datum}
              von={von}
              bis={bis}
              belegungen={raumBelegungen}
              onSlotKlick={(slotVon, slotBis) => {
                setVon(slotVon)
                setBis(slotBis)
              }}
            />

            {/* CLVN-012: Alternativen bei belegtem Zeitfenster */}
            {!slotVerfuegbar && alternativen.length > 0 && (
              <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-semibold text-destructive">
                  Das gewählte Zeitfenster ist belegt.
                </p>
                <p className="text-xs text-muted-foreground">Verfügbare Alternativen:</p>
                <div className="flex flex-wrap gap-2">
                  {alternativen.map(([altVon, altBis]) => (
                    <Button
                      key={`${altVon}-${altBis}`}
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => {
                        setVon(altVon)
                        setBis(altBis)
                      }}
                    >
                      <Clock className="size-3" />
                      {altVon}–{altBis} Uhr
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {!slotVerfuegbar && alternativen.length === 0 && (
              <p className="text-xs text-destructive">
                Das gewählte Zeitfenster ist belegt und es sind keine Alternativen verfügbar.
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={() => setSchritt(2)}
                disabled={!slotVerfuegbar}
                className="gap-2"
              >
                Weiter
                <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarCheck className="size-5" />
                Buchungsdetails
              </DialogTitle>
              <DialogDescription>
                Gib einen Meetingtitel an und bestätige die Buchung.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {raumZusammenfassung}

              <div className="grid gap-2">
                <Label htmlFor="titel">
                  Meetingtitel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titel"
                  placeholder="z. B. Kundenworkshop"
                  value={titel}
                  maxLength={100}
                  onChange={(e) => setTitel(e.target.value)}
                  aria-invalid={versucht && titelFehlt}
                />
                {versucht && titelFehlt && (
                  <p className="text-xs text-destructive">Bitte einen Titel angeben.</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notiz">Buchungsnotiz (optional)</Label>
                <Textarea
                  id="notiz"
                  placeholder="z. B. Bestuhlung U-Form, externe Gäste erwartet"
                  value={notiz}
                  maxLength={500}
                  rows={3}
                  onChange={(e) => setNotiz(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSchritt(1)} className="gap-2">
                <ArrowLeft className="size-4" />
                Zurück
              </Button>
              <Button onClick={handleBuchen} disabled={versucht && titelFehlt} className="gap-2">
                <CalendarCheck className="size-4" />
                Verbindlich buchen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
