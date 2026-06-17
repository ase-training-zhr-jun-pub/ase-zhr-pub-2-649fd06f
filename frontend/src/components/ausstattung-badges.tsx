import {
  Monitor,
  Video,
  PenLine,
  Phone,
  Presentation,
  Accessibility,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ausstattungLabel, type AusstattungId } from "@/lib/mock-data"

const ICONS: Record<AusstattungId, LucideIcon> = {
  screen: Monitor,
  vc: Video,
  whiteboard: PenLine,
  flipchart: Presentation,
  telefonbox: Phone,
  barrierefrei: Accessibility,
}

export function AusstattungIcon({ id }: { id: AusstattungId }) {
  const Icon = ICONS[id]
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        }
      />
      <TooltipContent>{ausstattungLabel(id)}</TooltipContent>
    </Tooltip>
  )
}

export function AusstattungIconList({ ids }: { ids: AusstattungId[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <AusstattungIcon key={id} id={id} />
      ))}
    </div>
  )
}

export function AusstattungBadge({ id }: { id: AusstattungId }) {
  const Icon = ICONS[id]
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Icon className="size-3.5" />
      {ausstattungLabel(id)}
    </Badge>
  )
}
