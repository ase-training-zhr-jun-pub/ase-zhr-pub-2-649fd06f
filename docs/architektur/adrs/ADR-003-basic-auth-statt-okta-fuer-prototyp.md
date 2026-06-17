# ADR-003: Basic Auth ohne Passwörter statt Okta für den Prototyp

**Status**: Akzeptiert

## Kontext

Das Calvin-System benötigt einen Mechanismus, um Buchungen einem Nutzer zuzuordnen. Ursprünglich war eine Okta-Integration (OIDC/OAuth2) für die Authentifizierung vorgesehen. Für die Prototyping-Phase wurde bewertet, ob diese Abhängigkeit zu einem Drittsystem tragbar ist.

## Entscheidung

Für den Prototyp wird **Basic Auth ohne Passwörter** eingesetzt: Der Nutzername wird im HTTP-Header mitgesendet, aber keine Passwortprüfung vorgenommen. Die Okta-Integration wird für den Produktivbetrieb nachgeliefert.

## Begründung

- Eine Okta-Integration erfordert Tenant-Setup, Konfiguration und Netzwerkzugang — das verlangsamt die Entwicklung im Prototyp erheblich.
- Für den Prototyp ist kein echter Schutz personenbezogener Daten erforderlich; es geht um die Validierung der Buchungslogik.
- Basic Auth ohne Passwort ermöglicht einfaches Testen mit verschiedenen Nutzern (Benutzername im Header reicht), ohne einen Identity Provider aufzusetzen.
- Die Architektur (Middleware-Schicht im ASP.NET Core) ist so gestaltet, dass die Auth-Implementierung austauschbar bleibt.

## Konsequenzen

- Der Booking Service akzeptiert Anfragen mit einem `X-User` HTTP-Header (oder HTTP Basic Auth ohne Passwort-Prüfung) als Nutzeridentifikation.
- Keinerlei Passwörter werden gespeichert oder übertragen.
- **Sicherheitsrisiko**: Diese Lösung ist ausschließlich für den Prototypbetrieb geeignet — jeder kann beliebige Nutzernamen angeben.
- Vor dem Produktivbetrieb muss die Basic-Auth-Middleware durch eine echte Okta-OIDC-Integration ersetzt werden (siehe [Technische Schulden](../technische-schulden.md)).
- Die Okta-Integration war Grundlage für die Entscheidung für ASP.NET Core (ADR-001) und bleibt das Ziel für den Produktivbetrieb.
