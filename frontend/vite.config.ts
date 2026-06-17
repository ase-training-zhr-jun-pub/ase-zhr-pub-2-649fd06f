import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Hinter dem Trainings-Proxy laufen die Assets unter einem Subpfad
// (…/t/<token>/s/<session>/proxy/5173/). Wir leiten diesen Subpfad aus
// VSCODE_PROXY_URI ab und setzen ihn als absoluten `base`, damit die Asset-URLs
// im gebauten HTML den vollständigen Pfad inkl. Portnummer enthalten. Der Proxy
// strippt den Prefix beim Weiterleiten wieder, daher wird der Build am Root
// ausgeliefert (siehe scripts/serve-static.mjs). Lokal: Fallback "/".
const proxyUri = process.env.VSCODE_PROXY_URI
const base = proxyUri
  ? new URL(proxyUri.replace("{{port}}", "5173")).pathname
  : "/"

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    // Hinter dem Trainings-Proxy wechselt der Host pro Session — alle erlauben.
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  // Production-Build via `vite preview` ausliefern (funktioniert hinter dem
  // strippenden Proxy, da der Build relative Asset-Pfade erzeugt).
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
