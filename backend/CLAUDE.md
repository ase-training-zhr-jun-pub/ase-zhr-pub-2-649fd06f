# Booking Service (Backend)

Backend-Service für Calvin, INNOQs Raum- und Arbeitsplatzbuchungssystem. Stellt die
REST-API für die SPA bereit und verantwortet die Buchungslogik (Validierung,
Konfliktprüfung, Verhinderung von Doppelbuchungen).

## Dokumentation

Bei fachlichen oder architektonischen Fragen **immer** zuerst hier nachsehen:

- **Architektur (arc42):** [`../docs/arc42/arc42.md`](../docs/arc42/arc42.md)
- **Architekturentscheidungen (ADRs):** [`../docs/architektur/adrs/`](../docs/architektur/adrs/)
  - ADR-001: ASP.NET Core als Technologie-Stack
  - ADR-002: Resource Service als Mock-Daten in der SPA
  - ADR-003: Basic Auth ohne Passwörter (Prototyp)
- **Qualitätsanforderungen:** [`../docs/architektur/qualitätsanforderungen.md`](../docs/architektur/qualitätsanforderungen.md)
- **Technische Schulden:** [`../docs/architektur/technische-schulden.md`](../docs/architektur/technische-schulden.md)
- **Produktvision & Domäne:** [`../docs/produkt/produktvision.md`](../docs/produkt/produktvision.md)
- **Glossar (Ubiquitous Language):** [`../docs/produkt/glossar.md`](../docs/produkt/glossar.md) — Wording **immer** einhalten
- **Backlog (User Stories CLVN-XXX):** [`../docs/produkt/backlog/`](../docs/produkt/backlog/)

## Technologie

- **.NET 9** / **ASP.NET Core** (Minimal APIs, C#)
- **REST-API** (JSON über HTTPS)
- **SQLite** + **Entity Framework Core** als dateibasierte Datenbank (geplant, siehe ADR-001)
- Nullable Reference Types und Implicit Usings aktiviert (siehe `.csproj`)

## Ordnerstruktur

```text
backend/
├── Program.cs                      # Einstiegspunkt, Service- & Endpoint-Konfiguration
├── CalvinBookingService.csproj     # Projektdatei, NuGet-Abhängigkeiten
├── CalvinBookingService.http       # HTTP-Requests zum manuellen Testen der Endpunkte
├── appsettings.json                # Konfiguration (alle Umgebungen)
├── appsettings.Development.json    # Konfiguration (Development-Override)
├── Properties/
│   └── launchSettings.json         # Start-Profile & Port (http → localhost:5000)
├── bin/                            # Build-Artefakte (nicht committen)
└── obj/                            # Build-Zwischendateien (nicht committen)
```

## Architektur

Aktuell ein **schlanker Minimal-API-Service**. Mit wachsender Buchungslogik wird eine
**Layered Architecture** angestrebt:

- **API / Endpoints** – HTTP-Routing, Request/Response-Mapping
- **Application / Services** – Buchungslogik, Konfliktprüfung, Validierung
- **Domain** – Entitäten (Buchung) und Geschäftsregeln
- **Infrastructure / Persistence** – EF Core, SQLite-Zugriff

Der Service arbeitet nur mit **IDs** für Standorte/Räume/Ausstattungen — die Stammdaten
liegen als Mock-Daten in der SPA (ADR-002).

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `Program.cs` | Service-Registrierung (CORS, OpenAPI), Middleware-Pipeline, Endpunkte |
| `Properties/launchSettings.json` | Port-Konfiguration (`http`-Profil → `localhost:5000`) |
| `CalvinBookingService.http` | Manuelles Testen der Endpunkte aus der IDE |
| `appsettings*.json` | Laufzeitkonfiguration |

## Wichtige Bash-Commands

> `dotnet` liegt unter `~/.dotnet`. Falls nicht im PATH: `export PATH="$PATH:$HOME/.dotnet"`.

| Aktion | Befehl |
|--------|--------|
| Starten (Dev) | `cd backend && dotnet run --launch-profile http` |
| Build | `cd backend && dotnet build` |
| Formatter | `cd backend && dotnet format` |
| Format prüfen (CI) | `cd backend && dotnet format --verify-no-changes` |
| NuGet-Paket hinzufügen | `cd backend && dotnet add package <Name>` |
| Endpunkt testen | `curl http://localhost:5000/api/hello` → `Hello World!` |

## Run Configurations

- **http-Profil** (Standard): `dotnet run --launch-profile http` → lauscht auf `http://localhost:5000`.
- Hinter dem Crucible-Proxy erfolgt der Zugriff **nicht** direkt, sondern über den
  `serve-static`-Reverse-Proxy der SPA, der `/api/*` an `localhost:5000` weiterleitet
  (siehe `../frontend/scripts/serve-static.mjs`). Kein öffentlicher Backend-Port nötig.

## Code Smells / zu vermeiden

- **Geschäftslogik in `Program.cs`** – Buchungslogik gehört in einen Service-/Domain-Layer, nicht inline in Endpunkt-Lambdas.
- **Stammdaten im Backend duplizieren** – Standorte/Räume kommen aus der SPA (ADR-002), das Backend hält nur IDs.
- **Doppelbuchungen nicht serverseitig absichern** – QS-2 verlangt serverseitige Konfliktprüfung; Validierung nur im Frontend ist unzureichend.
- **`async`-Methoden ohne `await`** bzw. blockierendes `.Result`/`.Wait()` – führt zu Deadlocks.
- **Fehlende Nullable-Annotations ignorieren** – Nullable ist aktiviert; Warnungen ernst nehmen.
- **Secrets in `appsettings.json`** – keine Passwörter/Keys einchecken.

## Sonstiges für Claude Code

- **Ubiquitous Language einhalten:** Begriffe aus dem [Glossar](../docs/produkt/glossar.md) verwenden (z. B. Buchung, Standort, Raum).
- **Conventional Commits** für alle Commits (siehe Projektregeln).
- Nach Code-Änderungen läuft automatisch `dotnet format` via PostToolUse-Hook (`.claude/settings.json`).
- Bei Unsicherheit über Architektur/Fachlichkeit immer die Doku unter `../docs/` konsultieren.
