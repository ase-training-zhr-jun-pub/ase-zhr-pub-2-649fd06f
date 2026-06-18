import { test, expect } from "@playwright/test"

/**
 * End-to-End-Test: Raumbuchungsprozess (CLVN-019)
 *
 * Ablauf:
 * 1. Buchungsübersicht öffnen, bisherige Buchungen zählen
 * 2. Standort auswählen (Header-Dropdown)
 * 3. Buchungsseite öffnen
 * 4. Datum wählen (morgigen Tag)
 * 5. Ersten verfügbaren Raum buchen
 * 6. Dialog Schritt 1 durchlaufen (Zeitraster → Weiter)
 * 7. Dialog Schritt 2: Meetingtitel eingeben → Buchen
 * 8. Buchungsübersicht öffnen
 * 9. Neue Buchung verifizieren
 */
test("Raumbuchungsprozess: von Standortauswahl bis zur Bestätigung in der Übersicht", async ({
  page,
}) => {
  // ── 1. Buchungsübersicht öffnen, aktuelle Buchungen zählen ────────────────
  await page.goto("/#/buchungen")
  await page.waitForLoadState("networkidle")

  await expect(
    page.getByRole("heading", { level: 1, name: "Meine Buchungen" }),
  ).toBeVisible()
  // Jede aktive Buchungskarte hat genau einen "Stornieren"-Button
  const initialAnzahl = await page
    .getByRole("button", { name: "Stornieren" })
    .count()

  // ── 2. Standort auswählen ─────────────────────────────────────────────────
  await page.getByRole("combobox", { name: "Standort wählen" }).click()
  await page.getByRole("option", { name: /Köln/ }).click()
  await expect(
    page.getByRole("combobox", { name: "Standort wählen" }),
  ).toContainText("Köln")

  // ── 3. Buchungsseite öffnen ───────────────────────────────────────────────
  await page.getByRole("link", { name: "Raum buchen" }).click()
  await expect(
    page.getByRole("heading", { name: "Raum buchen" }),
  ).toBeVisible()

  // ── 4. Datum wählen: morgen ───────────────────────────────────────────────
  // DatumPicker öffnen (CalendarIcon-Button in der Suchleiste)
  await page.locator("button").filter({ hasText: /^\w+, \d+\. \w+/ }).first().click()

  // Nächsten freien Tag im Kalender wählen (nicht deaktiviert)
  const ersterFreierTag = page
    .locator("td[data-day]")
    .filter({ hasNot: page.locator('[aria-disabled="true"]') })
    .first()
  await ersterFreierTag.click()

  // ── 5. Ersten verfügbaren Raum buchen ────────────────────────────────────
  // Warten bis Räume geladen sind, dann ersten "Buchen"-Button klicken
  const buchenButtons = page.getByRole("button", { name: "Buchen" })
  await expect(buchenButtons.first()).toBeEnabled({ timeout: 5_000 })
  await buchenButtons.first().click()

  // ── 6. Dialog Schritt 1: Zeitraster, dann Weiter ─────────────────────────
  const buchungsDialog = page.getByRole("dialog", { name: "Raum auswählen" })
  await expect(buchungsDialog).toBeVisible()
  const weiterButton = buchungsDialog.getByRole("button", { name: "Weiter" })
  await expect(weiterButton).toBeVisible()
  await weiterButton.click()

  // ── 7. Dialog Schritt 2: Meetingtitel eingeben und buchen ─────────────────
  // Dialog wechselt zu "Buchungsdetails"
  const buchungsdetailsDialog = page.getByRole("dialog", {
    name: "Buchungsdetails",
  })
  await expect(buchungsdetailsDialog).toBeVisible()

  const titelInput = buchungsdetailsDialog.getByPlaceholder("z. B. Kundenworkshop")
  await expect(titelInput).toBeVisible()

  const testTitel = `E2E-Test ${Date.now()}`
  await titelInput.fill(testTitel)

  await buchungsdetailsDialog
    .getByRole("button", { name: "Verbindlich buchen" })
    .click()

  // Erfolgs-Toast abwarten
  await expect(page.getByText("Raum gebucht")).toBeVisible({ timeout: 5_000 })

  // ── 8. Buchungsübersicht öffnen ───────────────────────────────────────────
  await page.getByRole("link", { name: "Meine Buchungen" }).click()
  await expect(
    page.getByRole("heading", { name: "Meine Buchungen" }),
  ).toBeVisible()

  // ── 9. Neue Buchung verifizieren ──────────────────────────────────────────
  await expect(page.getByText(testTitel)).toBeVisible({ timeout: 5_000 })

  // Anzahl der aktiven Buchungen hat zugenommen
  await expect(page.getByRole("button", { name: "Stornieren" })).toHaveCount(
    initialAnzahl + 1,
    { timeout: 5_000 },
  )
})
