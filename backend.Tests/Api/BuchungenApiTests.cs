using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CalvinBookingService.Tests.Api;

public class BuchungenApiTests : IClassFixture<CalvinWebApplicationFactory>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public BuchungenApiTests(CalvinWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── GET /api/hello ────────────────────────────────────────────────────────

    [Fact]
    public async Task HelloEndpoint_ReturnsHelloWorld()
    {
        var response = await _client.GetAsync("api/hello");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Hello World!", body);
    }

    // ── GET /api/buchungen ────────────────────────────────────────────────────

    [Fact]
    public async Task GetBuchungen_InitiallyEmpty()
    {
        var factory = new CalvinWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("api/buchungen");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var buchungen = await response.Content.ReadFromJsonAsync<JsonElement[]>(JsonOptions);
        Assert.NotNull(buchungen);
        Assert.Empty(buchungen);
    }

    [Fact]
    public async Task GetBuchungen_FilterByNutzerId()
    {
        // Arrange: zwei Buchungen anlegen
        await PostBuchungAsync("raum-1", "Meeting Alex", "alex", "09:00", "10:00");
        await PostBuchungAsync("raum-1", "Meeting Bob", "bob", "10:00", "11:00");

        var response = await _client.GetAsync("api/buchungen?nutzerId=alex");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var buchungen = await response.Content.ReadFromJsonAsync<JsonElement[]>(JsonOptions);
        Assert.NotNull(buchungen);
        Assert.All(buchungen, b =>
            Assert.Equal("alex", b.GetProperty("nutzerId").GetString()));
    }

    // ── POST /api/buchungen ───────────────────────────────────────────────────

    [Fact]
    public async Task PostBuchung_ValidBody_Returns201WithLocationHeader()
    {
        var payload = new
        {
            raumId = "raum-post-1",
            titel = "Teambesprechung",
            notiz = (string?)null,
            datum = "2026-07-01",
            von = "09:00",
            bis = "10:00",
            nutzerId = "user-1"
        };

        var response = await _client.PostAsJsonAsync("api/buchungen", payload);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var buchung = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        Assert.Equal("raum-post-1", buchung.GetProperty("raumId").GetString());
        Assert.Equal("Teambesprechung", buchung.GetProperty("titel").GetString());
    }

    [Fact]
    public async Task PostBuchung_UngueltigesDatum_Returns409()
    {
        var payload = new
        {
            raumId = "raum-2",
            titel = "Test",
            notiz = (string?)null,
            datum = "nicht-ein-datum",
            von = "09:00",
            bis = "10:00",
            nutzerId = "user-1"
        };

        var response = await _client.PostAsJsonAsync("api/buchungen", payload);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        Assert.True(body.TryGetProperty("fehler", out _), "Response soll 'fehler'-Feld enthalten.");
    }

    [Fact]
    public async Task PostBuchung_VonGroesserGleichBis_Returns409()
    {
        var payload = new
        {
            raumId = "raum-3",
            titel = "Test",
            notiz = (string?)null,
            datum = "2026-07-01",
            von = "10:00",
            bis = "09:00",
            nutzerId = "user-1"
        };

        var response = await _client.PostAsJsonAsync("api/buchungen", payload);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task PostBuchung_ZweimalGleicherSlot_Returns409BeimZweiten()
    {
        var payload = new
        {
            raumId = "raum-doppel",
            titel = "Erste Buchung",
            notiz = (string?)null,
            datum = "2026-07-02",
            von = "14:00",
            bis = "15:00",
            nutzerId = "user-1"
        };

        var first = await _client.PostAsJsonAsync("api/buchungen", payload);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await _client.PostAsJsonAsync("api/buchungen", payload);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    // ── PATCH /api/buchungen/{id} ─────────────────────────────────────────────

    [Fact]
    public async Task PatchBuchung_Existierend_Returns200MitAktualisierterBuchung()
    {
        // Anlegen
        var created = await PostBuchungAsync("raum-patch-1", "Alt", "user-2", "08:00", "09:00");
        var id = created.GetProperty("id").GetString();
        Assert.NotNull(id);

        var patch = new { titel = "Neu" };
        var response = await _client.PatchAsJsonAsync($"api/buchungen/{id}", patch);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        Assert.Equal("Neu", updated.GetProperty("titel").GetString());
    }

    [Fact]
    public async Task PatchBuchung_NichtGefunden_Returns404()
    {
        var patch = new { titel = "Neu" };
        var response = await _client.PatchAsJsonAsync("api/buchungen/nicht-vorhanden", patch);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PatchBuchung_Zeitkonflikt_Returns409()
    {
        // Zwei Buchungen im gleichen Raum anlegen
        await PostBuchungAsync("raum-patch-konflikt", "Erste", "user-3", "09:00", "10:00", datum: "2026-07-10");
        var zweite = await PostBuchungAsync("raum-patch-konflikt", "Zweite", "user-3", "10:00", "11:00", datum: "2026-07-10");
        var id = zweite.GetProperty("id").GetString();
        Assert.NotNull(id);

        // Zweite auf den Zeitslot der ersten verschieben → Konflikt
        var patch = new { von = "09:00", bis = "10:00" };
        var response = await _client.PatchAsJsonAsync($"api/buchungen/{id}", patch);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    // ── DELETE /api/buchungen/{id} ────────────────────────────────────────────

    [Fact]
    public async Task DeleteBuchung_Existierend_Returns204()
    {
        var created = await PostBuchungAsync("raum-del-1", "Zu löschen", "user-4", "11:00", "12:00");
        var id = created.GetProperty("id").GetString();
        Assert.NotNull(id);

        var response = await _client.DeleteAsync($"api/buchungen/{id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteBuchung_NichtGefunden_Returns404()
    {
        var response = await _client.DeleteAsync("api/buchungen/nicht-vorhanden");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteBuchung_NachDelete_NichtMehrInGetMitStatusBestaetigt()
    {
        var created = await PostBuchungAsync("raum-del-2", "Wird storniert", "user-5", "13:00", "14:00");
        var id = created.GetProperty("id").GetString();
        Assert.NotNull(id);

        await _client.DeleteAsync($"api/buchungen/{id}");

        // GET /api/buchungen liefert alle Buchungen — stornierte sind enthalten aber nicht bestaetigt
        var allResponse = await _client.GetAsync("api/buchungen");
        var alle = await allResponse.Content.ReadFromJsonAsync<JsonElement[]>(JsonOptions);
        Assert.NotNull(alle);

        // Die gelöschte Buchung darf nicht mehr mit Status "bestaetigt" vorhanden sein
        var bestaetigt = alle
            .Where(b => b.GetProperty("id").GetString() == id)
            .Where(b =>
            {
                var status = b.GetProperty("status").GetString();
                return status == "bestaetigt";
            })
            .ToList();

        Assert.Empty(bestaetigt);
    }

    // ── Hilfsmethode ─────────────────────────────────────────────────────────

    private async Task<JsonElement> PostBuchungAsync(
        string raumId,
        string titel,
        string nutzerId,
        string von,
        string bis,
        string datum = "2026-07-01")
    {
        var payload = new
        {
            raumId,
            titel,
            notiz = (string?)null,
            datum,
            von,
            bis,
            nutzerId
        };

        var response = await _client.PostAsJsonAsync("api/buchungen", payload);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
    }
}
