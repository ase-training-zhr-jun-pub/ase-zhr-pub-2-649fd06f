using CalvinBookingService.Domain;

namespace CalvinBookingService.Application;

/// <summary>
/// Persistenz-Abstraktion für Buchungen. Aktuell In-Memory (siehe Infrastructure);
/// gemäß ADR-001 ist SQLite + EF Core als dateibasierte Ablage geplant und kann
/// hinter diesem Interface ohne Änderung der Buchungslogik ergänzt werden.
/// </summary>
public interface IBuchungRepository
{
    IReadOnlyList<Buchung> AlleLaden();
    Buchung? Laden(string id);
    void Speichern(Buchung buchung);
}
