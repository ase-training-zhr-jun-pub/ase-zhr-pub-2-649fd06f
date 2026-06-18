using CalvinBookingService.Application;
using CalvinBookingService.Domain;

namespace CalvinBookingService.Infrastructure;

public class EfBuchungRepository(BuchungDbContext db) : IBuchungRepository
{
    public IReadOnlyList<Buchung> AlleLaden() =>
        db.Buchungen.ToList();

    public Buchung? Laden(string id) =>
        db.Buchungen.Find(id);

    public void Speichern(Buchung buchung)
    {
        if (db.Buchungen.Find(buchung.Id) is null)
            db.Buchungen.Add(buchung);
        else
            db.Entry(buchung).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
        db.SaveChanges();
    }
}
