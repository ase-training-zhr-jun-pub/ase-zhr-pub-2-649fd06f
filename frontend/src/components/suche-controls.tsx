import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatumPicker } from "@/components/datum-picker"
import { useSuche } from "@/lib/suche-context"

// Zeitraster 08:00–19:00 in 30-Minuten-Schritten.
export const ZEITEN: string[] = Array.from({ length: 23 }, (_, i) => {
  const min = 8 * 60 + i * 30
  const h = String(Math.floor(min / 60)).padStart(2, "0")
  const m = String(min % 60).padStart(2, "0")
  return `${h}:${m}`
})

function ZeitSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  options: string[]
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t} value={t}>
              {t} Uhr
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function SucheControls() {
  const { datum, von, bis, setSuche } = useSuche()

  // "bis" muss nach "von" liegen.
  const bisOptionen = ZEITEN.filter((t) => t > von)

  const handleVon = (neuVon: string) => {
    if (bis <= neuVon) {
      const idx = ZEITEN.indexOf(neuVon)
      setSuche({ von: neuVon, bis: ZEITEN[Math.min(idx + 2, ZEITEN.length - 1)] })
    } else {
      setSuche({ von: neuVon })
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Datum</Label>
        <DatumPicker value={datum} onChange={(d) => setSuche({ datum: d })} />
      </div>
      <ZeitSelect label="Von" value={von} onChange={handleVon} options={ZEITEN} />
      <ZeitSelect
        label="Bis"
        value={bis}
        onChange={(v) => setSuche({ bis: v })}
        options={bisOptionen}
      />
    </div>
  )
}
