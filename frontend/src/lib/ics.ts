import { raumById, standortById, type Buchung } from "@/lib/mock-data"

// Erzeugt eine iCalendar-Datei (.ics) für eine Buchung und stößt den Download an.
export function exportiereBuchungAlsIcs(b: Buchung): void {
  const raum = raumById(b.raumId)
  const ort = standortById(raum?.standortId ?? "")
  const stamp = `${b.datum.replace(/-/g, "")}T${b.von.replace(":", "")}00`
  const ende = `${b.datum.replace(/-/g, "")}T${b.bis.replace(":", "")}00`

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calvin//Raumbuchung//DE",
    "BEGIN:VEVENT",
    `UID:${b.id}@calvin.innoq`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${stamp}`,
    `DTEND:${ende}`,
    `SUMMARY:${b.titel}`,
    `LOCATION:${raum?.name ?? ""}, ${ort?.name ?? ""}`,
    b.notiz ? `DESCRIPTION:${b.notiz}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `calvin-${b.id}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
