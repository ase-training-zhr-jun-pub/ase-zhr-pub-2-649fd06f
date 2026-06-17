import { CalendarIcon } from "lucide-react"
import { de } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDatumLang, parseDatum, HEUTE } from "@/lib/format"

interface DatumPickerProps {
  /** ISO "YYYY-MM-DD" */
  value: string
  onChange: (iso: string) => void
  className?: string
}

const toIso = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const t = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${t}`
}

export function DatumPicker({ value, onChange, className }: DatumPickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("justify-start gap-2 font-normal", className)}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {formatDatumLang(value)}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={de}
          selected={parseDatum(value)}
          defaultMonth={parseDatum(value)}
          disabled={{ before: parseDatum(HEUTE) }}
          onSelect={(d) => d && onChange(toIso(d))}
        />
      </PopoverContent>
    </Popover>
  )
}
