import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type ViteDevServer } from "vite"
import type { IncomingMessage, ServerResponse } from "node:http"

export default defineConfig(() => {
  const proxyUri = process.env.VSCODE_PROXY_URI
  const base = proxyUri
    ? new URL(proxyUri.replace("{{port}}", "5173")).pathname
    : "/"

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      // Der Crucible-Proxy strippt den Subpfad beim Weiterleiten.
      // Vite erwartet Anfragen mit vollem base-Präfix — dieses Plugin stellt ihn
      // wieder voran, damit Vite index.html und alle Dev-Assets findet.
      base !== "/"
        ? {
            name: "proxy-path-rewrite",
            configureServer(server: ViteDevServer) {
              server.middlewares.use((req: IncomingMessage, _res: ServerResponse, next: () => void) => {
                // API-Pfade nicht umschreiben – die werden vom Vite-Proxy abgefangen.
                if (req.url && !req.url.startsWith(base) && !req.url.startsWith("/api/")) {
                  req.url = base.replace(/\/$/, "") + req.url
                }
                next()
              })
            },
          }
        : null,
    ].filter(Boolean),
    server: {
      host: "0.0.0.0",
      allowedHosts: true as true,
      proxy: {
        "/api": "http://localhost:5000",
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: true as true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
