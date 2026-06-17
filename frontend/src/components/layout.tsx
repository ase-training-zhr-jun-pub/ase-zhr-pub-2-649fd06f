import { MapPin } from "lucide-react"
import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { standorte, standortById } from "@/lib/mock-data"
import { useStandort } from "@/lib/standort-context"

export function Layout() {
  const { standortId, setStandortId } = useStandort()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <Select
              value={standortId}
              onValueChange={(v) => v && setStandortId(v)}
            >
              <SelectTrigger className="w-[180px]" aria-label="Standort wählen">
                <SelectValue>
                  {(value: string) => standortById(value)?.name ?? "Standort"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {standorte.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {s.land}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
