import { useState } from "react"
import {
  CalendarX2,
  Clock,
  MapPin,
  Share2,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { raumById, standortById, type Buchung } from "@/lib/mock-data"
import { formatDatumKurz, formatDatumLang, formatDauer, istZukunft } from "@/lib/format"
import { exportiereBuchungAlsIcs } from "@/lib/ics"
import { useBuchungen } from "@/lib/buchungen-context"

function BuchungCard({
  buchung,
  vergangen,
  onStornieren,
}: {
  buchung: Buchung
  vergangen: boolean
  onStornieren: (b: Buchung) => void
}) {
  const raum = raumById(buchung.raumId)
  const ort = standortById(raum?.standortId ?? "")

  const teilen = () => {
    exportiereBuchungAlsIcs(buchung)
    toast.success("Kalendereintrag exportiert", {
      description: "Die .ics-Datei wurde heruntergeladen.",
    })
  }

  return (
    <Card className={vergangen ? "opacity-70" : undefined}>
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
        {/* Datum — klickbar zur Detailseite */}
        <Link
          to={`/buchungen/${buchung.id}`}
          className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-muted py-2 hover:bg-muted/80 transition-colors"
        >
          <span className="text-xs text-muted-foreground">
            {formatDatumKurz(buchung.datum).split(",")[0]}
          </span>
          <span className="text-xl font-semibold leading-none">
            {buchung.datum.slice(8, 10)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatDatumLang(buchung.datum).split(" ")[2]}
          </span>
        </Link>

        {/* Inhalt — klickbar zur Detailseite */}
        <Link to={`/buchungen/${buchung.id}`} className="min-w-0 flex-1 space-y-1 hover:opacity-80 transition-opacity">
          <div className="font-medium">{buchung.titel}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {raum?.name} · {ort?.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {buchung.von}–{buchung.bis} Uhr ({formatDauer(buchung.von, buchung.bis)})
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              bis {raum?.kapazitaet} Pers.
            </span>
          </div>
          {buchung.notiz && (
            <div className="flex items-start gap-1 text-sm text-muted-foreground">
              <StickyNote className="mt-0.5 size-3.5 shrink-0" />
              {buchung.notiz}
            </div>
          )}
        </Link>

        {/* Aktionen */}
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={teilen}>
            <Share2 className="size-4" />
            Teilen
          </Button>
          {!vergangen && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => onStornieren(buchung)}
            >
              <Trash2 className="size-4" />
              Stornieren
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LeererZustand({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <CalendarX2 className="size-8" />
        <p>{text}</p>
        <Button render={<Link to="/buchen" />} nativeButton={false}>
          Raum buchen
        </Button>
      </CardContent>
    </Card>
  )
}

export function MeineBuchungen() {
  const { eigene, stornieren } = useBuchungen()
  const [stornoZiel, setStornoZiel] = useState<Buchung | null>(null)

  const sortiert = [...eigene].sort(
    (a, b) => a.datum.localeCompare(b.datum) || a.von.localeCompare(b.von),
  )
  const anstehend = sortiert.filter((b) => istZukunft(b.datum))
  const vergangen = sortiert.filter((b) => !istZukunft(b.datum)).reverse()

  const bestaetigeStorno = async () => {
    if (!stornoZiel) return
    await stornieren(stornoZiel.id)
    toast.success("Buchung storniert", {
      description: `${stornoZiel.titel} wurde storniert.`,
    })
    setStornoZiel(null)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meine Buchungen</h1>
        <p className="text-muted-foreground">
          Übersicht deiner Raumbuchungen an allen Standorten.
        </p>
      </div>

      <Tabs defaultValue="anstehend">
        <TabsList>
          <TabsTrigger value="anstehend">
            Anstehend
            <Badge variant="secondary" className="ml-2">
              {anstehend.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="vergangen">
            Vergangen
            <Badge variant="secondary" className="ml-2">
              {vergangen.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anstehend" className="space-y-3">
          {anstehend.length === 0 ? (
            <LeererZustand text="Du hast keine anstehenden Buchungen." />
          ) : (
            anstehend.map((b) => (
              <BuchungCard
                key={b.id}
                buchung={b}
                vergangen={false}
                onStornieren={setStornoZiel}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="vergangen" className="space-y-3">
          {vergangen.length === 0 ? (
            <LeererZustand text="Keine vergangenen Buchungen." />
          ) : (
            vergangen.map((b) => (
              <BuchungCard
                key={b.id}
                buchung={b}
                vergangen
                onStornieren={setStornoZiel}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Storno-Bestätigung */}
      <Dialog open={stornoZiel !== null} onOpenChange={(o) => !o && setStornoZiel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buchung stornieren?</DialogTitle>
            <DialogDescription>
              {stornoZiel && (
                <>
                  „{stornoZiel.titel}" am {formatDatumLang(stornoZiel.datum)} (
                  {stornoZiel.von}–{stornoZiel.bis} Uhr) wird storniert. Der Raum
                  wird wieder für andere freigegeben.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStornoZiel(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={bestaetigeStorno}>
              Ja, stornieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
