---
name: epic
description: Erstellt ein Epic aus einem Backbone-Item der User-Story-Map. Verwendung: /epic "<backbone-item>" <pfad-zur-user-story-map>
argument-hint: "[backbone-item] [pfad-zur-user-story-map]"
disable-model-invocation: true
---

Erstelle ein Epic für das folgende Backbone-Item aus der User-Story-Map.

**Backbone-Item:** $ARGUMENTS[0]
**User-Story-Map:** $ARGUMENTS[1]

## Bestehende Epics im Backlog

!`ls docs/produkt/backlog/ 2>/dev/null | grep -E '^CLVN-[0-9]+-EPIC-' | sort || echo "(noch keine Epics vorhanden)"`

## Anweisungen

1. Lies die User-Story-Map unter `$ARGUMENTS[1]` und identifiziere alle User Stories, die dem Backbone-Item **$ARGUMENTS[0]** zugeordnet sind.

2. Bestimme die nächste freie Epic-Nummer aus der obigen Liste. Nimm die höchste vorhandene CLVN-Nummer und addiere 1. Falls noch keine Epics existieren, starte mit 1.

3. Leite den Dateinamen nach diesem Schema ab:
   `CLVN-<NUMMER>-EPIC-<NAME>.md`
   wobei `<NAME>` der Backbone-Item-Name in Großbuchstaben mit Bindestrichen ist (Umlaute umschreiben: Ä→AE, Ö→OE, Ü→UE, ß→SS, Leerzeichen→Bindestrich).
   Beispiel: "Räume finden" → `CLVN-2-EPIC-RAEUME-FINDEN.md`

4. Erstelle das Epic unter `docs/produkt/backlog/<dateiname>` mit dieser Struktur:

   Zeile 1: # CLVN-<NUMMER> Epic: <Backbone-Item-Name>
   
   Abschnitt ## Beschreibung
   Kurze Beschreibung, was dieses Epic umfasst und welchen Nutzen es für den INNOQ-Mitarbeiter hat.
   
   Abschnitt ## User Stories
   Jede User Story aus der User-Story-Map für dieses Backbone-Item als vollständiger User-Story-Satz:
   "Als INNOQ-Mitarbeiter möchte ich [Aktion], damit [Nutzen]."
   Jede Story mit ihrer Priorisierung kennzeichnen: [MVP] oder [Future]

**Wichtige Regeln:**
- Alle User Stories des Backbone-Items werden aufgelistet – keine weglassen.
- Es werden KEINE separaten User-Story-Ticket-Dateien erstellt. Nur die Auflistung im Epic.
- Keine doppelten CLVN-Nummern – immer die bestehenden Epics prüfen.
- Halte dich an die Ubiquitous Language aus `docs/produkt/glossar.md`.
