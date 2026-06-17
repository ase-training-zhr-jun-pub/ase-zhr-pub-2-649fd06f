// Minimaler statischer Server für den Production-Build (dist/).
//
// Liefert die Dateien am ROOT-Pfad aus. Hintergrund: Der Trainings-Proxy
// (…/t/<token>/s/<session>/proxy/5173/) strippt diesen Prefix beim Weiterleiten,
// sodass hier Requests wie `/assets/index-xxx.js` ankommen. Der Build referenziert
// Assets über den absoluten Proxy-Subpfad (vite `base`), wodurch die URLs im
// Browser den vollständigen Pfad inkl. Portnummer enthalten.
//
// `vite preview` ist hier ungeeignet, weil es `base` erneut anwendet und damit
// nicht am Root ausliefern würde.

import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"

const DIST = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist")
const PORT = Number(process.env.PORT) || 5173

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".map": "application/json; charset=utf-8",
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost")
    // Pfad relativ auflösen und Directory-Traversal verhindern.
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "")
    if (rel === "") rel = "index.html"
    const filePath = normalize(join(DIST, rel))
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end("Forbidden")
      return
    }

    let target = filePath
    try {
      const s = await stat(target)
      if (s.isDirectory()) target = join(target, "index.html")
    } catch {
      // Datei nicht gefunden — SPA-Fallback auf index.html (HashRouter nutzt #,
      // daher genügt das für direkte Aufrufe und unbekannte Pfade).
      target = join(DIST, "index.html")
    }

    const data = await readFile(target)
    res.writeHead(200, {
      "Content-Type": MIME[extname(target)] || "application/octet-stream",
    })
    res.end(data)
  } catch (err) {
    res.writeHead(500).end(`Server error: ${err.message}`)
  }
})

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Calvin-Build läuft auf http://localhost:${PORT}/`)
})
