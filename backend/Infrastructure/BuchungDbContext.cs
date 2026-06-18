using CalvinBookingService.Domain;
using Microsoft.EntityFrameworkCore;

namespace CalvinBookingService.Infrastructure;

public class BuchungDbContext(DbContextOptions<BuchungDbContext> options) : DbContext(options)
{
    public DbSet<Buchung> Buchungen => Set<Buchung>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Buchung>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Status).HasConversion<string>();
        });
    }
}
