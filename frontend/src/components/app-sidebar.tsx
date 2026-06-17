import { CalendarPlus, LayoutDashboard, CalendarCheck } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { aktuellerNutzer } from "@/lib/mock-data"

const navigation = [
  { titel: "Dashboard", url: "/", icon: LayoutDashboard },
  { titel: "Raum buchen", url: "/buchen", icon: CalendarPlus },
  { titel: "Meine Buchungen", url: "/buchungen", icon: CalendarCheck },
]

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            C
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Calvin</div>
            <div className="text-xs text-muted-foreground">Raumbuchung</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const aktiv =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={aktiv}
                      render={<Link to={item.url} />}
                    >
                      <item.icon />
                      <span>{item.titel}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-9">
            <AvatarFallback>{aktuellerNutzer.initialen}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-sm font-medium">{aktuellerNutzer.name}</div>
            <div className="text-xs text-muted-foreground">
              {aktuellerNutzer.rolle}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
