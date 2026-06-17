# ADR-002: Resource Service in die SPA integriert (Mock-Daten)

**Status**: Akzeptiert

## Kontext

Standorte, Räume und Ausstattungen müssen im System verfügbar sein. Ursprünglich war ein separater Resource Service als eigener Backend-Dienst angedacht. Für die Prototyping-Phase wurde bewertet, ob dieser Service eigenständig implementiert oder vereinfacht werden soll.

## Entscheidung

Der Resource Service wird **nicht als separater Service** betrieben. Stattdessen werden Standorte, Räume und Ausstattungen als **Mock-Daten direkt in der SPA** hinterlegt. Der Booking Service arbeitet ausschließlich mit den IDs aus diesen Mock-Daten — er speichert keine Ressourcen-Details.

## Begründung

- Im Prototyp sind die Stammdaten (Standorte, Räume) stabil und ändern sich nicht — ein eigener Service wäre Overhead ohne Mehrwert.
- Die SPA enthält bereits Mock-Daten aus der Prototyping-Phase; diese weiterzuverwenden spart Entwicklungszeit.
- Der Booking Service bleibt schlank: Er verwaltet nur Buchungen (RaumId, ZeitId, NutzerId) und delegiert Ressourcen-Details an die SPA.
- Ein vollständiger Resource Service kann in einem späteren Schritt als echte API nachgeliefert werden, ohne die Buchungslogik zu ändern.

## Konsequenzen

- Mock-Daten für Standorte, Räume und Ausstattungen liegen in `frontend/src/lib/mock-data.ts`.
- Der Booking Service persistiert nur IDs — keine Ressourcen-Details.
- Neue Standorte oder Räume erfordern im Prototyp eine Anpassung der Mock-Daten und ein neues Frontend-Deployment.
- Technische Schuld: Mock-Daten müssen vor dem Produktivbetrieb durch einen echten Resource Service ersetzt werden (siehe [Technische Schulden](../technische-schulden.md)).
