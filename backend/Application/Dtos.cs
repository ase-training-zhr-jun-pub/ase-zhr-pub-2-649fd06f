using CalvinBookingService.Domain;

namespace CalvinBookingService.Application;

/// <summary>Anfrage zum Anlegen einer Buchung (CLVN-019 Raumbuchung absenden).</summary>
public record BuchungAnlegenRequest(
    string RaumId,
    string Titel,
    string? Notiz,
    string Datum,
    string Von,
    string Bis,
    string NutzerId);

/// <summary>Anfrage zum Ändern einer Buchung (Teil-Update, CLVN-027).</summary>
public record BuchungAendernRequest(
    string? Titel,
    string? Notiz,
    string? Datum,
    string? Von,
    string? Bis);

/// <summary>Ergebnis der Verfügbarkeitsprüfung (CLVN-010 Verfügbarkeit prüfen).</summary>
public record VerfuegbarkeitResponse(
    bool Verfuegbar,
    IReadOnlyList<Buchung> Konflikte);
