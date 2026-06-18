using System.Globalization;

namespace CalvinBookingService.Domain;

/// <summary>
/// Geschäftsregeln rund um Zeitfenster: Parsen von "HH:MM"-Zeiten und die
/// Überlappungsprüfung, die der Verfügbarkeits- und Konfliktlogik zugrunde liegt.
/// </summary>
public static class Zeitfenster
{
    /// <summary>Wandelt "HH:MM" in Minuten seit Mitternacht. Null bei ungültigem Format.</summary>
    public static int? AlsMinuten(string? hhmm)
    {
        if (string.IsNullOrWhiteSpace(hhmm))
            return null;
        if (!TimeOnly.TryParseExact(hhmm, "HH:mm", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var zeit))
            return null;
        return zeit.Hour * 60 + zeit.Minute;
    }

    /// <summary>Prüft, ob ein ISO-Datum "yyyy-MM-dd" gültig ist.</summary>
    public static bool IstGueltigesDatum(string? datum) =>
        !string.IsNullOrWhiteSpace(datum)
        && DateOnly.TryParseExact(datum, "yyyy-MM-dd", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out _);

    /// <summary>
    /// Überlappen sich zwei halboffene Zeitintervalle [aVon, aBis) und [bVon, bBis)?
    /// Aneinandergrenzende Buchungen (z. B. 09:00–10:00 und 10:00–11:00) gelten
    /// nicht als Konflikt.
    /// </summary>
    public static bool Ueberlappt(int aVon, int aBis, int bVon, int bBis) =>
        aVon < bBis && bVon < aBis;
}
