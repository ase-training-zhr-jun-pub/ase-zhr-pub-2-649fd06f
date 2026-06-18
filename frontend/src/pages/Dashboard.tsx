import { ArrowRight, CalendarClock, MapPin, Search, Sparkles } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SucheControls } from "@/components/suche-controls"
import { aktuellerNutzer, raumById, standortById } from "@/lib/mock-data"
import { useBuchungen } from "@/lib/buchungen-context"
import {
  formatDatumKurz,
  formatDauer,
  formatWochentag,
  istZukunft,
} from "@/lib/format"
import { useStandort } from "@/lib/standort-context"

export function Dashboard() {
  const navigate = useNavigate()
  const { standortId } = useStandort()
  const { eigene } = useBuchungen()
  const standort = standortById(standortId)

  const anstehend = eigene
    .filter((b) => istZukunft(b.datum))
    .sort((a, b) => a.datum.localeCompare(b.datum) || a.von.localeCompare(b.von))

  const naechste = anstehend[0]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Begrüßung */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hallo {aktuellerNutzer.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          {naechste ? (
            <>
              Dein nächster Termin im Büro:{" "}
              <span className="font-medium text-foreground">
                {formatWochentag(naechste.datum)}, {formatDatumKurz(naechste.datum)}
              </span>{" "}
              · {raumById(naechste.raumId)?.name}
            </>
          ) : (
            "Du hast aktuell keine anstehenden Buchungen."
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Schnellbuchung */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-5" />
              Schnellbuchung
            </CardTitle>
            <CardDescription>
              Verfügbare Räume an deinem Standort finden und direkt buchen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Standort:</span>
              <Badge variant="secondary">{standort?.name}</Badge>
              <span className="text-xs text-muted-foreground">
                (oben rechts wechselbar)
              </span>
            </div>
            <SucheControls />
            <Button onClick={() => navigate("/buchen")} className="gap-2">
              Räume suchen
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Standort-Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              Tipp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Du bist meist remote und selten im Büro? Buche deinen Raum am besten
              3–7 Tage im Voraus, damit dein Wunschraum sicher frei ist.
            </p>
            <p>
              Calvin blockiert gebuchte Räume automatisch – so kommt es nie zu
              Doppelbuchungen.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nächste Buchungen */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="size-5" />
            Deine nächsten Buchungen
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to="/buchungen" />}
          >
            Alle ansehen
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {anstehend.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Keine anstehenden Buchungen.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {anstehend.slice(0, 3).map((b) => {
              const raum = raumById(b.raumId)
              const ort = standortById(raum?.standortId ?? "")
              return (
                <Card key={b.id} className="transition-colors hover:bg-accent/40">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex w-14 flex-col items-center justify-center rounded-lg bg-muted py-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDatumKurz(b.datum).split(",")[0]}
                      </span>
                      <span className="text-lg font-semibold leading-none">
                        {b.datum.slice(8, 10)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{b.titel}</div>
                      <div className="text-sm text-muted-foreground">
                        {raum?.name} · {ort?.name} · {b.von}–{b.bis} Uhr
                      </div>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {formatDauer(b.von, b.bis)}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
