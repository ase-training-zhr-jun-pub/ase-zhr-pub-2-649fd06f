import { useEffect, useState } from "react"
import { CalendarCheck } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatumPicker } from "@/components/datum-picker"
import { ZEITEN } from "@/components/suche-controls"
import { raumById, standortById, type Buchung } from "@/lib/mock-data"
import { formatDatumLang, formatDauer } from "@/lib/format"
import { useBuchungen } from "@/lib/buchungen-context"

interface BuchungAendernDialogProps {
  buchung: Buchung | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGeaendert?: () => void
}

export function BuchungAendernDialog({
  buchung,
  open,
  onOpenChange,
  onGeaendert,
}: BuchungAendernDialogProps) {
  const { aendern } = useBuchungen()

  const [datum, setDatum] = useState(buchung?.datum ?? "")
  const [von, setVon] = useState(buchung?.von ?? "")
  const [bis, setBis] = useState(buchung?.bis ?? "")
  const [titel, setTitel] = useState(buchung?.titel ?? "")
  const [notiz, setNotiz] = useState(buchung?.notiz ?? "")
  const [versucht, setVersucht] = useState(false)
  const [laedt, setLaedt] = useState(false)

  useEffect(() => {
    if (open && buchung) {
      setDatum(buchung.datum)
      setVon(buchung.von)
      setBis(buchung.bis)
      setTitel(buchung.titel)
      setNotiz(buchung.notiz ?? "")
      setVersucht(false)
    }
  }, [open, buchung])

  if (!buchung) return null

  const raum = raumById(buchung.raumId)
  const ort = standortById(raum?.standortId ?? "")

  const titelFehlt = titel.trim() === ""
  const bisOptionen = ZEITEN.filter((t) => t > von)

  const handleVon = (neuVon: string | null) => {
    if (!neuVon) return
    setVon(neuVon)
    if (bis <= neuVon) {
      const idx = ZEITEN.indexOf(neuVon)
      setBis(ZEITEN[Math.min(idx + 2, ZEITEN.length - 1)])
    }
  }

  const handleSpeichern = async () => {
    setVersucht(true)
    if (titelFehlt) return

    setLaedt(true)
    try {
      await aendern(buchung.id, {
        datum,
        von,
        bis,
        titel: titel.trim(),
        notiz: notiz.trim() || undefined,
      })
      onOpenChange(false)
      toast.success("Buchung geändert", {
        description: `${raum?.name ?? buchung.raumId} · ${formatDatumLang(datum)} · ${von}–${bis} Uhr`,
      })
      onGeaendert?.()
    } catch (e) {
      toast.error("Änderung fehlgeschlagen", {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLaedt(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="size-5" />
            Buchung ändern
          </DialogTitle>
          <DialogDescription>
            Ändere Datum, Uhrzeit, Titel oder Notiz deiner Buchung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Schreibgeschützte Rauminfo */}
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <span className="font-semibold">{raum?.name ?? buchung.raumId}</span>
            {ort && (
              <span className="ml-1 text-muted-foreground">
                · {ort.name} · {raum?.etage}
              </span>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              Aktuelle Buchung: {formatDatumLang(buchung.datum)} ·{" "}
              {buchung.von}–{buchung.bis} Uhr (
              {formatDauer(buchung.von, buchung.bis)})
            </div>
          </div>

          {/* Datum */}
          <div className="grid gap-1.5">
            <Label>Datum</Label>
            <DatumPicker value={datum} onChange={setDatum} className="w-full" />
          </div>

          {/* Von / Bis */}
          <div className="flex gap-4">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="ae-von">Von</Label>
              <Select value={von} onValueChange={handleVon}>
                <SelectTrigger id="ae-von">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZEITEN.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t} Uhr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="ae-bis">Bis</Label>
              <Select value={bis} onValueChange={(v) => v && setBis(v)}>
                <SelectTrigger id="ae-bis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bisOptionen.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t} Uhr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Titel */}
          <div className="grid gap-2">
            <Label htmlFor="ae-titel">
              Meetingtitel <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ae-titel"
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

          {/* Notiz */}
          <div className="grid gap-2">
            <Label htmlFor="ae-notiz">Buchungsnotiz (optional)</Label>
            <Textarea
              id="ae-notiz"
              placeholder="z. B. Bestuhlung U-Form, externe Gäste erwartet"
              value={notiz}
              maxLength={500}
              rows={3}
              onChange={(e) => setNotiz(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={laedt}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSpeichern}
            disabled={(versucht && titelFehlt) || laedt}
            className="gap-2"
          >
            <CalendarCheck className="size-4" />
            Änderungen speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
