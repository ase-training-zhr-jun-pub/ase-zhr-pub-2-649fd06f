# Qualitätsanforderungen Calvin

Fünf Qualitätsszenarien, abgeleitet aus einem Interview zu den wesentlichen Qualitätszielen des Calvin-Systems.

Template: `<Umgebung> <Auslöser> <Ereignis> <Artefakt> <Reaktion> <Maß>`

---

## QS-1: Doppelbuchungen verhindern

**Qualitätsmerkmal**: Zuverlässigkeit / Datenintegrität

Im normalen Betrieb versuchen zwei INNOQ-Consultants gleichzeitig (innerhalb derselben Sekunde) denselben Konferenzraum für denselben Zeitraum zu buchen — etwa für einen Kundenworkshop. Der Booking Service verarbeitet die erste vollständige Anfrage erfolgreich und lehnt die zweite mit einer verständlichen Fehlermeldung und einem Alternativvorschlag ab. Doppelbuchungen werden in 99,9 % der Fälle serverseitig verhindert.

---

## QS-2: Performance bei Stoßzeiten

**Qualitätsmerkmal**: Performance / Antwortzeit

Montags zwischen 8:00 und 9:00 Uhr suchen viele INNOQ-Mitarbeiter gleichzeitig nach verfügbaren Räumen für die laufende Woche. Ein Mitarbeiter gibt Standort und Zeitraum ein und löst eine Suchanfrage aus. Die Ergebnisliste mit allen verfügbaren Räumen wird innerhalb von 500 ms angezeigt — auch bei bis zu 150 gleichzeitigen Nutzern.

---

## QS-3: Verfügbarkeit während Kernarbeitszeiten

**Qualitätsmerkmal**: Verfügbarkeit

Während der INNOQ-Kernarbeitszeiten (Montag–Freitag, 8:00–18:00 Uhr) fällt der Calvin-Service ungeplant aus. Mitarbeiter können sich überbrückend per Slack koordinieren. Das System ist innerhalb von 30 Minuten wiederhergestellt. Die Gesamtverfügbarkeit in den Kernarbeitszeiten beträgt mindestens 98 %.

---

## QS-4: Erstbuchung ohne Schulung

**Qualitätsmerkmal**: Benutzbarkeit / Erlernbarkeit

Ein neuer INNOQ-Mitarbeiter ohne jede Vorkenntnisse öffnet Calvin zum ersten Mal und möchte einen Besprechungsraum für den nächsten Tag buchen. Ohne Hilfe durch Kollegen oder Dokumentation findet er intuitiv den richtigen Weg durch die Oberfläche und schließt die Buchung erfolgreich ab. Die Buchung gelingt in maximal 5 Minuten und maximal 5 Klicks. 90 % der neuen Mitarbeiter schaffen ihre erste Buchung ohne fremde Hilfe.

---

## QS-5: Transparenz bei gleichzeitigem Datenschutz

**Qualitätsmerkmal**: Datenschutz / Transparenz

Im laufenden Betrieb ruft ein INNOQ-Mitarbeiter die Buchungsübersicht eines Standorts auf. Er sieht, welche Räume wann belegt sind und wer die Buchung erstellt hat — für die interne Koordination ("Wer ist wann im Büro?"). Buchungsdaten werden ausschließlich intern angezeigt, nicht an Dritte weitergegeben und DSGVO-konform gespeichert (kein Retention über den Buchungszeitraum hinaus ohne explizite Einwilligung).
