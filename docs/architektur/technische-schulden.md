# Technische Schulden

Bewusst eingegangene Kompromisse für die Prototyping-Phase, die vor dem Produktivbetrieb adressiert werden müssen.

---

## TS-1: Basic Auth ohne Passwörter (Sicherheit)

**Schwere**: Kritisch — muss vor Produktivbetrieb behoben sein

**Beschreibung**: Der Booking Service nutzt Basic Auth ohne Passwortprüfung. Jeder kann beliebige Nutzernamen angeben — es gibt keinen echten Identitätsnachweis.

**Ursache**: Okta-Integration wurde für den Prototyp bewusst zurückgestellt, um Abhängigkeiten zu Drittsystemen zu vermeiden (ADR-003).

**Lösung**: Ersetzen der Basic-Auth-Middleware durch eine echte OIDC-Integration via Okta und `Microsoft.Identity.Web` (gemäß ADR-001).

---

## TS-2: Stammdaten als Mock-Daten in der SPA (Änderbarkeit)

**Schwere**: Hoch — schränkt Betrieb und Wartung ein

**Beschreibung**: Standorte, Räume und Ausstattungen sind als statische Mock-Daten in `frontend/src/lib/mock-data.ts` hinterlegt. Neue Räume oder Standorte erfordern ein neues Frontend-Deployment.

**Ursache**: Ein separater Resource Service wurde für den Prototyp nicht implementiert (ADR-002).

**Lösung**: Implementierung eines echten Resource Service mit eigener API und Datenpersistenz. Die SPA muss die Mock-Daten durch API-Calls ersetzen. Der Booking Service arbeitet weiterhin nur mit IDs und muss nicht angepasst werden.

---

## TS-3: SQLite als Datenbank (Skalierbarkeit)

**Schwere**: Mittel — ausreichend für Prototyp, begrenzt bei Produktion

**Beschreibung**: Der Booking Service nutzt SQLite als dateibasierte Datenbank. SQLite unterstützt keine echte Nebenläufigkeit unter Last und ist nicht für verteilten Betrieb geeignet.

**Ursache**: SQLite wurde für einfaches lokales Setup und schnelle Entwicklung gewählt (ADR-001).

**Lösung**: Migration auf PostgreSQL oder eine vergleichbare serverbasierte Datenbank vor dem Produktivbetrieb. EF Core macht die Migration durch Datenbankprovider-Wechsel beherrschbar.
