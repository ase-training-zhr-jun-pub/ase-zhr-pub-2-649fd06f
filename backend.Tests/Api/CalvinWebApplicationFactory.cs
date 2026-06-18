using CalvinBookingService.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CalvinBookingService.Tests.Api;

public class CalvinWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Alten DbContext entfernen
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<BuchungDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // In-Memory SQLite mit eindeutiger Datei pro Test-Run
            var dbPath = $"{Path.GetTempFileName()}.db";
            services.AddDbContext<BuchungDbContext>(opt =>
                opt.UseSqlite($"Data Source={dbPath}"));
        });

        builder.UseEnvironment("Development");
    }
}
