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
import { standortById, type Raum } from "@/lib/mock-data"
import { formatDatumLang, formatDauer } from "@/lib/format"
import { useSuche } from "@/lib/suche-context"
import { useBuchungen } from "@/lib/buchungen-context"

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
  const { datum, von, bis } = useSuche()
  const { addBuchung } = useBuchungen()
  const [schritt, setSchritt] = useState<1 | 2>(1)
  const [titel, setTitel] = useState("")
  const [notiz, setNotiz] = useState("")
  const [versucht, setVersucht] = useState(false)

  useEffect(() => {
    if (open) {
      setSchritt(1)
      setTitel("")
      setNotiz("")
      setVersucht(false)
    }
  }, [open, raum?.id])

  if (!raum) return null
  const ort = standortById(raum.standortId)
  const titelFehlt = titel.trim() === ""

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

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button onClick={() => setSchritt(2)} className="gap-2">
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
