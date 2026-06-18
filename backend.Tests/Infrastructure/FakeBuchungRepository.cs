using CalvinBookingService.Application;
using CalvinBookingService.Domain;

namespace CalvinBookingService.Tests.Infrastructure;

/// <summary>
/// In-Memory-Implementierung von IBuchungRepository ohne EF Core oder externe
/// Abhängigkeiten – ausschließlich für Unit-Tests gedacht.
/// </summary>
public class FakeBuchungRepository : IBuchungRepository
{
    private readonly Dictionary<string, Buchung> _store = new();

    public IReadOnlyList<Buchung> AlleLaden() => _store.Values.ToList();

    public Buchung? Laden(string id) =>
        _store.TryGetValue(id, out var buchung) ? buchung : null;

    public void Speichern(Buchung buchung) =>
        _store[buchung.Id] = buchung;

    /// <summary>Hilfsmethode: direkt eine Buchung einfügen ohne Service-Logik.</summary>
    public void Seed(Buchung buchung) => _store[buchung.Id] = buchung;
}
