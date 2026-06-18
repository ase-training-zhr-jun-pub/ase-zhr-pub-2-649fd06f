namespace CalvinBookingService.Domain;

/// <summary>Status einer Raumbuchung (siehe Glossar / Ubiquitous Language).</summary>
public enum BuchungStatus
{
    Bestaetigt,
    Storniert,
}

/// <summary>
/// Eine Raumbuchung: Reservierung eines Konferenzraums durch einen Mitarbeiter
/// für einen Zeitraum. Das Backend arbeitet nur mit IDs für Raum/Standort/Nutzer –
/// die Stammdaten liegen als Mock-Daten in der SPA (ADR-001/002).
/// </summary>
public class Buchung
{
    public required string Id { get; init; }
    public required string RaumId { get; set; }
    public required string Titel { get; set; }
    public string? Notiz { get; set; }

    /// <summary>ISO-Datum, z. B. "2026-06-23".</summary>
    public required string Datum { get; set; }

    /// <summary>Startzeit im Format "HH:MM".</summary>
    public required string Von { get; set; }

    /// <summary>Endzeit im Format "HH:MM".</summary>
    public required string Bis { get; set; }

    public required string NutzerId { get; init; }

    public BuchungStatus Status { get; set; } = BuchungStatus.Bestaetigt;
}
