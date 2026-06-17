import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

type Status = "loading" | "ok" | "error"

export function BackendStatus() {
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    // Relativer Pfad — funktioniert lokal und hinter dem Crucible-Proxy.
    fetch("api/hello")
      .then((res) => res.text())
      .then((text) => {
        setMessage(text)
        setStatus("ok")
      })
      .catch(() => setStatus("error"))
  }, [])

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Verbindung zum Backend wird geprüft…
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
        <XCircle className="size-4" />
        Backend nicht erreichbar
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
      <CheckCircle className="size-4" />
      Backend antwortet: <span className="font-medium">{message}</span>
    </div>
  )
}
