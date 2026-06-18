using CalvinBookingService.Domain;

namespace CalvinBookingService.Application;

public class BuchungService(IBuchungRepository repository)
{
    public (Buchung? Buchung, string? Fehler) Anlegen(BuchungAnlegenRequest request)
    {
        if (!Zeitfenster.IstGueltigesDatum(request.Datum))
            return (null, "Ungültiges Datum.");

        var von = Zeitfenster.AlsMinuten(request.Von);
        var bis = Zeitfenster.AlsMinuten(request.Bis);

        if (von is null || bis is null)
            return (null, "Ungültige Zeitangabe.");
        if (von >= bis)
            return (null, "Von muss vor Bis liegen.");

        var konflikt = repository.AlleLaden().Any(b =>
            b.RaumId == request.RaumId &&
            b.Datum == request.Datum &&
            b.Status == BuchungStatus.Bestaetigt &&
            Zeitfenster.AlsMinuten(b.Von) is int bVon &&
            Zeitfenster.AlsMinuten(b.Bis) is int bBis &&
            Zeitfenster.Ueberlappt(von.Value, bis.Value, bVon, bBis));

        if (konflikt)
            return (null, "Zeitfenster ist bereits belegt.");

        var buchung = new Buchung
        {
            Id = Guid.NewGuid().ToString(),
            RaumId = request.RaumId,
            Titel = request.Titel,
            Notiz = request.Notiz,
            Datum = request.Datum,
            Von = request.Von,
            Bis = request.Bis,
            NutzerId = request.NutzerId,
        };

        repository.Speichern(buchung);
        return (buchung, null);
    }

    public (Buchung? Buchung, string? Fehler) Aendern(string id, BuchungAendernRequest request)
    {
        var buchung = repository.Laden(id);
        if (buchung is null)
            return (null, "Buchung nicht gefunden.");
        if (buchung.Status == BuchungStatus.Storniert)
            return (null, "Stornierte Buchungen können nicht geändert werden.");

        var neuesDatum = request.Datum ?? buchung.Datum;
        var neuesVon = request.Von ?? buchung.Von;
        var neuesBis = request.Bis ?? buchung.Bis;

        var von = Zeitfenster.AlsMinuten(neuesVon);
        var bis = Zeitfenster.AlsMinuten(neuesBis);

        if (von is null || bis is null)
            return (null, "Ungültige Zeitangabe.");
        if (von >= bis)
            return (null, "Von muss vor Bis liegen.");

        var konflikt = repository.AlleLaden().Any(b =>
            b.Id != id &&
            b.RaumId == buchung.RaumId &&
            b.Datum == neuesDatum &&
            b.Status == BuchungStatus.Bestaetigt &&
            Zeitfenster.AlsMinuten(b.Von) is int bVon &&
            Zeitfenster.AlsMinuten(b.Bis) is int bBis &&
            Zeitfenster.Ueberlappt(von.Value, bis.Value, bVon, bBis));

        if (konflikt)
            return (null, "Zeitfenster ist bereits belegt.");

        if (request.Titel is not null) buchung.Titel = request.Titel;
        if (request.Notiz is not null) buchung.Notiz = request.Notiz;
        buchung.Datum = neuesDatum;
        buchung.Von = neuesVon;
        buchung.Bis = neuesBis;

        repository.Speichern(buchung);
        return (buchung, null);
    }

    public bool Stornieren(string id)
    {
        var buchung = repository.Laden(id);
        if (buchung is null) return false;
        buchung.Status = BuchungStatus.Storniert;
        repository.Speichern(buchung);
        return true;
    }
}
