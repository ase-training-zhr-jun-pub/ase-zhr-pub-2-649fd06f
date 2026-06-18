using System.Text.Json;
using System.Text.Json.Serialization;
using CalvinBookingService.Application;
using CalvinBookingService.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddDbContext<BuchungDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=calvin.db"));

builder.Services.AddScoped<IBuchungRepository, EfBuchungRepository>();
builder.Services.AddScoped<BuchungService>();

builder.Services.ConfigureHttpJsonOptions(opt =>
    opt.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<BuchungDbContext>().Database.EnsureCreated();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();

app.MapGet("/api/hello", () => "Hello World!");

app.MapGet("/api/buchungen", (BuchungDbContext db, string? nutzerId) =>
{
    var q = db.Buchungen.AsQueryable();
    if (nutzerId is not null)
        q = q.Where(b => b.NutzerId == nutzerId);
    return q.ToList();
});

app.MapPost("/api/buchungen", (BuchungAnlegenRequest request, BuchungService service) =>
{
    var (buchung, fehler) = service.Anlegen(request);
    return buchung is not null
        ? Results.Created($"/api/buchungen/{buchung.Id}", buchung)
        : Results.Conflict(new { fehler });
});

app.MapPatch("/api/buchungen/{id}", (string id, BuchungAendernRequest request, BuchungService service) =>
{
    var (buchung, fehler) = service.Aendern(id, request);
    if (buchung is not null) return Results.Ok(buchung);
    return fehler == "Buchung nicht gefunden."
        ? Results.NotFound()
        : Results.Conflict(new { fehler });
});

app.MapDelete("/api/buchungen/{id}", (string id, BuchungService service) =>
    service.Stornieren(id) ? Results.NoContent() : Results.NotFound());

app.Run();

public partial class Program { }
