# ADR-001: Technologie-Stack für den Booking Service

**Status**: Akzeptiert

## Kontext

Der Booking Service wird als eigenständiger Backend-Service implementiert, der die REST API für das Calvin-Frontend bereitstellt. Folgende Anforderungen standen bei der Technologiewahl im Vordergrund:

- REST API als Kommunikationsschnittstelle zur SPA
- Kompatibilität mit einer dateibasierten Datenbank (z. B. SQLite) für einfaches lokales Setup
- Schnelle Entwicklung — der Service soll zeitnah implementiert werden
- Perspektivisch (Produktivbetrieb): Okta-Integration für Authentifizierung und Autorisierung

Drei Technologien wurden verglichen: **ASP.NET Core (C#)**, **Spring Boot (Java)** und **Python FastAPI**.

## Entscheidung

Wir setzen **ASP.NET Core (C#)** als Technologie-Stack für den Booking Service ein.

## Begründung

### Vergleich der Alternativen

| Kriterium | ASP.NET Core (C#) | Spring Boot (Java) | Python FastAPI |
|---|---|---|---|
| REST API | Minimal APIs / Controller, first-class | `@RestController`, sehr ausgereift | Schnell zu prototypen, automatische OpenAPI-Docs |
| Dateibasierte DB | EF Core + SQLite out of the box | H2 nativ, SQLite via Dialect | SQLAlchemy + SQLite gut unterstützt |
| Okta-Integration | Offizielles Okta .NET SDK, OIDC via `Microsoft.Identity.Web` | Offizieller Okta Spring Boot Starter | Möglich via `authlib`, kein offizieller SDK |
| Schnelle Entwicklung | Bekannter Stack — maximale Geschwindigkeit | Solide, aber unbekannter Stack | Nur schnell mit Python-Erfahrung |

### Ausschlaggebende Argumente für ASP.NET Core

1. **Vorhandenes Know-how**: Das Entwicklungsteam kennt C# und .NET — der größte Hebel für schnelle Lieferung.
2. **Erstklassige Okta-Unterstützung**: Das offizielle Okta .NET SDK und `Microsoft.Identity.Web` decken die perspektivische OIDC-Integration vollständig ab.
3. **EF Core + SQLite**: Datenbankzugriff und Migrationen sind in wenigen Zeilen konfigurierbar, kein zusätzlicher Setup-Aufwand.
4. **Kein Mehrwert durch Wechsel**: Spring Boot wäre technisch gleichwertig, bietet aber keinen Vorteil — und FastAPI hat den schwächsten Okta-Support der drei Optionen.

## Konsequenzen

- Der Booking Service wird in **C# mit ASP.NET Core** (Minimal APIs) implementiert.
- Als Datenbank wird **SQLite** mit **Entity Framework Core** verwendet.
- Authentifizierung im Prototyp: Basic Auth ohne Passwörter (ADR-003). Die Okta-Integration folgt vor dem Produktivbetrieb via `Microsoft.Identity.Web`.
- Das Projekt liegt unter `backend/`.
