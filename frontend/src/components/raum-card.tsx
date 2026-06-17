import { CheckCircle2, Clock, Users, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AusstattungIconList } from "@/components/ausstattung-badges"
import { cn } from "@/lib/utils"
import type { Raum } from "@/lib/mock-data"
import { useSuche } from "@/lib/suche-context"
import { useBuchungen } from "@/lib/buchungen-context"

// Tagesfenster für die Belegungsleiste: 8–19 Uhr.
const TAG_START = 8 * 60
const TAG_ENDE = 19 * 60
const TAG_SPANNE = TAG_ENDE - TAG_START

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}
const prozent = (min: number) => ((min - TAG_START) / TAG_SPANNE) * 100

function BelegungsLeiste({ raumId }: { raumId: string }) {
  const { datum, von, bis } = useSuche()
  const { belegungen } = useBuchungen()
  const belegt = belegungen(raumId, datum)

  const slotLeft = prozent(toMin(von))
  const slotWidth = prozent(toMin(bis)) - slotLeft

  return (
    <div className="space-y-1">
      <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
        {/* belegte Zeitfenster */}
        {belegt.map((b) => {
          const left = prozent(toMin(b.von))
          const width = prozent(toMin(b.bis)) - left
          return (
            <div
              key={b.id}
              title={`Belegt ${b.von}–${b.bis} Uhr`}
              className="absolute top-0 h-full bg-muted-foreground/30"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}
        {/* gewähltes Zeitfenster */}
        <div
          className="absolute top-0 h-full rounded-sm border-2 border-primary bg-primary/10"
          style={{ left: `${slotLeft}%`, width: `${slotWidth}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>8</span>
        <span>11</span>
        <span>14</span>
        <span>17</span>
        <span>19 Uhr</span>
      </div>
    </div>
  )
}

interface RaumCardProps {
  raum: Raum
  onBuchen: (raum: Raum) => void
}

export function RaumCard({ raum, onBuchen }: RaumCardProps) {
  const { datum, von, bis } = useSuche()
  const { istVerfuegbar, belegungen } = useBuchungen()
  const frei = istVerfuegbar(raum.id, datum, von, bis)
  const konflikte = belegungen(raum.id, datum).filter(
    (b) => toMin(von) < toMin(b.bis) && toMin(b.von) < toMin(bis),
  )

  return (
    <Card className={cn(!frei && "opacity-90")}>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{raum.name}</h3>
              <Badge variant="secondary" className="gap-1 font-normal">
                <Users className="size-3.5" />
                {raum.kapazitaet}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {raum.etage} · {raum.beschreibung}
            </p>
          </div>
          {frei ? (
            <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Frei
            </Badge>
          ) : (
            <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
              <XCircle className="size-3.5" />
              Belegt
            </Badge>
          )}
        </div>

        <AusstattungIconList ids={raum.ausstattung} />

        <BelegungsLeiste raumId={raum.id} />

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-sm text-muted-foreground">
            {frei ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                {von}–{bis} Uhr verfügbar
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Belegt:{" "}
                {konflikte.map((k) => `${k.von}–${k.bis}`).join(", ")} Uhr
              </span>
            )}
          </div>
          <Button onClick={() => onBuchen(raum)} disabled={!frei}>
            Buchen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
