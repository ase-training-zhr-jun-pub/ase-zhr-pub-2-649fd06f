import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AusstattungBadge } from "@/components/ausstattung-badges"
import { BuchungAendernDialog } from "@/components/buchung-aendern-dialog"
import { raumById, standortById } from "@/lib/mock-data"
import { formatDatumLang, formatDauer, istZukunft } from "@/lib/format"
import { useBuchungen } from "@/lib/buchungen-context"

export function BuchungDetail() {
  const { id } = useParams<{ id: string }>()
  const { buchungen, stornieren } = useBuchungen()

  const [stornoOffen, setStornoOffen] = useState(false)
  const [aendernOffen, setAendernOffen] = useState(false)

  const buchung = buchungen.find((b) => b.id === id)

  if (!buchung) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" render={<Link to="/buchungen" />} nativeButton={false} className="gap-2">
          <ArrowLeft className="size-4" />
          Zurück zu Meine Buchungen
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Buchung nicht gefunden.
          </CardContent>
        </Card>
      </div>
    )
  }

  const raum = raumById(buchung.raumId)
  const ort = standortById(raum?.standortId ?? "")
  const zukunft = istZukunft(buchung.datum)
  const istAktiv = buchung.status === "bestaetigt"

  const bestaetigeStorno = async () => {
    await stornieren(buchung.id)
    toast.success("Buchung storniert", {
      description: `${buchung.titel} wurde storniert.`,
    })
    setStornoOffen(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Zurück-Link */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/buchungen" />}
        nativeButton={false}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        Zurück zu Meine Buchungen
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{buchung.titel}</CardTitle>
              {buchung.status === "storniert" && (
                <span className="mt-1 inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Storniert
                </span>
              )}
            </div>
            {/* Aktionsbuttons */}
            {istAktiv && zukunft && (
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setAendernOffen(true)}
                >
                  <Pencil className="size-4" />
                  Buchung ändern
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setStornoOffen(true)}
                >
                  <Trash2 className="size-4" />
                  Stornieren
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {/* Raum und Standort */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Raum
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="font-medium">{raum?.name ?? buchung.raumId}</span>
                {ort && (
                  <span className="text-muted-foreground">
                    · {ort.name} · {raum?.etage}
                  </span>
                )}
              </div>
              {raum && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  bis {raum.kapazitaet} Personen
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Zeitfenster */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Zeitfenster
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" />
                {formatDatumLang(buchung.datum)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                {buchung.von}–{buchung.bis} Uhr
                <span className="text-muted-foreground">
                  ({formatDauer(buchung.von, buchung.bis)})
                </span>
              </div>
            </div>
          </div>

          {/* Notiz */}
          {buchung.notiz && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Notiz
                </h3>
                <div className="flex items-start gap-2 text-sm">
                  <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{buchung.notiz}</span>
                </div>
              </div>
            </>
          )}

          {/* Ausstattung */}
          {raum && raum.ausstattung.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Ausstattung
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {raum.ausstattung.map((a) => (
                    <AusstattungBadge key={a} id={a} />
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Storno-Bestätigung */}
      <Dialog open={stornoOffen} onOpenChange={setStornoOffen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buchung stornieren?</DialogTitle>
            <DialogDescription>
              „{buchung.titel}" am {formatDatumLang(buchung.datum)} ({buchung.von}–
              {buchung.bis} Uhr) wird storniert. Der Raum wird wieder für andere
              freigegeben.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStornoOffen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={bestaetigeStorno}>
              Ja, stornieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ändern-Dialog */}
      <BuchungAendernDialog
        buchung={buchung}
        open={aendernOffen}
        onOpenChange={setAendernOffen}
      />
    </div>
  )
}
