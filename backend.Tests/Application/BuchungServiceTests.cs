using CalvinBookingService.Application;
using CalvinBookingService.Domain;
using CalvinBookingService.Tests.Infrastructure;

namespace CalvinBookingService.Tests.Application;

public class BuchungServiceTests
{
    // =========================================================================
    // Hilfsmethoden
    // =========================================================================

    private static (BuchungService service, FakeBuchungRepository repo) ErstelleService()
    {
        var repo = new FakeBuchungRepository();
        var service = new BuchungService(repo);
        return (service, repo);
    }

    private static BuchungAnlegenRequest StandardAnlegen(
        string raumId = "raum-1",
        string? datum = "2026-06-23",
        string von = "09:00",
        string bis = "10:00",
        string titel = "Teambesprechung",
        string nutzerId = "nutzer-1",
        string? notiz = null) =>
        new(raumId, titel, notiz, datum!, von, bis, nutzerId);

    private static Buchung ErstelleBestaetigteBuchung(
        string id = "b1",
        string raumId = "raum-1",
        string datum = "2026-06-23",
        string von = "09:00",
        string bis = "10:00") =>
        new()
        {
            Id = id,
            RaumId = raumId,
            Titel = "Bestehende Buchung",
            Datum = datum,
            Von = von,
            Bis = bis,
            NutzerId = "nutzer-2",
            Status = BuchungStatus.Bestaetigt,
        };

    // =========================================================================
    // Anlegen – Happy Path
    // =========================================================================

    [Fact]
    public void Anlegen_GueltigeAnfrage_ErstelltBuchung()
    {
        var (service, repo) = ErstelleService();

        var (buchung, fehler) = service.Anlegen(StandardAnlegen());

        Assert.Null(fehler);
        Assert.NotNull(buchung);
        Assert.Equal("raum-1", buchung.RaumId);
        Assert.Equal("2026-06-23", buchung.Datum);
        Assert.Equal("09:00", buchung.Von);
        Assert.Equal("10:00", buchung.Bis);
        Assert.Equal(BuchungStatus.Bestaetigt, buchung.Status);
        Assert.NotEmpty(buchung.Id);
    }

    [Fact]
    public void Anlegen_GueltigeAnfrage_SpeichertBuchungImRepository()
    {
        var (service, repo) = ErstelleService();

        var (buchung, _) = service.Anlegen(StandardAnlegen());

        Assert.NotNull(buchung);
        Assert.Equal(buchung, repo.Laden(buchung.Id));
    }

    [Fact]
    public void Anlegen_MitNotiz_SpeichertNotiz()
    {
        var (service, _) = ErstelleService();
        var request = StandardAnlegen(notiz: "Bitte Beamer reservieren");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(fehler);
        Assert.Equal("Bitte Beamer reservieren", buchung!.Notiz);
    }

    // =========================================================================
    // Anlegen – Validierungsfehler
    // =========================================================================

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData("abc")]
    [InlineData("18.06.2026")]
    [InlineData("2026-13-01")]
    [InlineData(null)]
    public void Anlegen_UngueltigesDatum_GibtFehlerZurueck(string? datum)
    {
        var (service, _) = ErstelleService();
        var request = StandardAnlegen(datum: datum);

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(buchung);
        Assert.Equal("Ungültiges Datum.", fehler);
    }

    [Theory]
    [InlineData("9:00", "10:00")]   // fehlende führende Null bei Von
    [InlineData("09:00", "10:0")]   // fehlende führende Null bei Bis
    [InlineData("abc", "10:00")]    // Von kein Zeitformat
    [InlineData("09:00", "xyz")]    // Bis kein Zeitformat
    public void Anlegen_UngueltigeZeitangabe_GibtFehlerZurueck(string von, string bis)
    {
        var (service, _) = ErstelleService();
        var request = StandardAnlegen(von: von, bis: bis);

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(buchung);
        Assert.Equal("Ungültige Zeitangabe.", fehler);
    }

    [Fact]
    public void Anlegen_VonGleichBis_GibtFehlerZurueck()
    {
        var (service, _) = ErstelleService();
        var request = StandardAnlegen(von: "09:00", bis: "09:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(buchung);
        Assert.Equal("Von muss vor Bis liegen.", fehler);
    }

    [Fact]
    public void Anlegen_VonNachBis_GibtFehlerZurueck()
    {
        var (service, _) = ErstelleService();
        var request = StandardAnlegen(von: "11:00", bis: "09:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(buchung);
        Assert.Equal("Von muss vor Bis liegen.", fehler);
    }

    // =========================================================================
    // Anlegen – Konfliktprüfung
    // =========================================================================

    [Fact]
    public void Anlegen_UeberschneidetBestehendeBuchung_GibtKonfliktfehlerZurueck()
    {
        var (service, repo) = ErstelleService();
        repo.Seed(ErstelleBestaetigteBuchung(von: "09:00", bis: "11:00"));
        // Neue Buchung überschneidet: 10:00–12:00
        var request = StandardAnlegen(von: "10:00", bis: "12:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(buchung);
        Assert.Equal("Zeitfenster ist bereits belegt.", fehler);
    }

    [Fact]
    public void Anlegen_ExaktAneinandergrenzend_KeinKonflikt()
    {
        var (service, repo) = ErstelleService();
        repo.Seed(ErstelleBestaetigteBuchung(von: "09:00", bis: "10:00"));
        // Neue Buchung beginnt genau wenn bestehende endet → KEIN Konflikt
        var request = StandardAnlegen(von: "10:00", bis: "11:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
    }

    [Fact]
    public void Anlegen_AnderererRaum_KeinKonflikt()
    {
        var (service, repo) = ErstelleService();
        repo.Seed(ErstelleBestaetigteBuchung(raumId: "raum-1", von: "09:00", bis: "10:00"));
        // Gleiche Zeit, aber anderer Raum → KEIN Konflikt
        var request = StandardAnlegen(raumId: "raum-2", von: "09:00", bis: "10:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
    }

    [Fact]
    public void Anlegen_AnderesDatum_KeinKonflikt()
    {
        var (service, repo) = ErstelleService();
        repo.Seed(ErstelleBestaetigteBuchung(datum: "2026-06-23", von: "09:00", bis: "10:00"));
        // Gleiche Zeit, gleicher Raum, aber anderes Datum → KEIN Konflikt
        var request = StandardAnlegen(datum: "2026-06-24", von: "09:00", bis: "10:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
    }

    [Fact]
    public void Anlegen_BestehendeBuchungIstStorniert_KeinKonflikt()
    {
        var (service, repo) = ErstelleService();
        var storniert = ErstelleBestaetigteBuchung(von: "09:00", bis: "10:00");
        storniert.Status = BuchungStatus.Storniert;
        repo.Seed(storniert);
        // Stornierte Buchung darf keinen Konflikt auslösen
        var request = StandardAnlegen(von: "09:00", bis: "10:00");

        var (buchung, fehler) = service.Anlegen(request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
    }

    // =========================================================================
    // Aendern – Happy Path
    // =========================================================================

    [Fact]
    public void Aendern_GueltigeAnfrage_AendertTitel()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung();
        repo.Seed(bestehend);
        var request = new BuchungAendernRequest(Titel: "Neuer Titel", Notiz: null, Datum: null, Von: null, Bis: null);

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
        Assert.Equal("Neuer Titel", buchung.Titel);
    }

    [Fact]
    public void Aendern_GueltigeAnfrage_AendertZeitfenster()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung(von: "09:00", bis: "10:00");
        repo.Seed(bestehend);
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "10:00", Bis: "11:00");

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(fehler);
        Assert.Equal("10:00", buchung!.Von);
        Assert.Equal("11:00", buchung.Bis);
    }

    [Fact]
    public void Aendern_NullFelder_BeibehaltenAlteWerte()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung(von: "09:00", bis: "10:00");
        bestehend.Titel = "Alter Titel";
        repo.Seed(bestehend);
        // Alle Felder null → nur Speichern, nichts ändern
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: null, Bis: null);

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(fehler);
        Assert.Equal("Alter Titel", buchung!.Titel);
        Assert.Equal("09:00", buchung.Von);
        Assert.Equal("10:00", buchung.Bis);
    }

    [Fact]
    public void Aendern_EigeneBuchungOhneSelbstkonflikt_Erlaubt()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung(von: "09:00", bis: "10:00");
        repo.Seed(bestehend);
        // Dieselbe Zeit nochmal → KEIN Selbst-Konflikt
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "09:00", Bis: "10:00");

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
    }

    // =========================================================================
    // Aendern – Fehlerfälle
    // =========================================================================

    [Fact]
    public void Aendern_NichtVorhandeneBuchung_GibtFehlerZurueck()
    {
        var (service, _) = ErstelleService();
        var request = new BuchungAendernRequest(Titel: "X", Notiz: null, Datum: null, Von: null, Bis: null);

        var (buchung, fehler) = service.Aendern("nicht-vorhanden", request);

        Assert.Null(buchung);
        Assert.Equal("Buchung nicht gefunden.", fehler);
    }

    [Fact]
    public void Aendern_StoniertesBuchung_GibtFehlerZurueck()
    {
        var (service, repo) = ErstelleService();
        var storniert = ErstelleBestaetigteBuchung();
        storniert.Status = BuchungStatus.Storniert;
        repo.Seed(storniert);
        var request = new BuchungAendernRequest(Titel: "X", Notiz: null, Datum: null, Von: null, Bis: null);

        var (buchung, fehler) = service.Aendern(storniert.Id, request);

        Assert.Null(buchung);
        Assert.Equal("Stornierte Buchungen können nicht geändert werden.", fehler);
    }

    [Fact]
    public void Aendern_VonGleichBis_GibtFehlerZurueck()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung();
        repo.Seed(bestehend);
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "10:00", Bis: "10:00");

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(buchung);
        Assert.Equal("Von muss vor Bis liegen.", fehler);
    }

    [Fact]
    public void Aendern_VonNachBis_GibtFehlerZurueck()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung();
        repo.Seed(bestehend);
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "11:00", Bis: "09:00");

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(buchung);
        Assert.Equal("Von muss vor Bis liegen.", fehler);
    }

    [Theory]
    [InlineData("9:00", "10:00")]
    [InlineData("09:00", "10:0")]
    [InlineData("abc", "10:00")]
    public void Aendern_UngueltigeZeitangabe_GibtFehlerZurueck(string von, string bis)
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung();
        repo.Seed(bestehend);
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: von, Bis: bis);

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(buchung);
        Assert.Equal("Ungültige Zeitangabe.", fehler);
    }

    // =========================================================================
    // Aendern – Konfliktprüfung (Änderung)
    // =========================================================================

    [Fact]
    public void Aendern_KonfliktMitAndererBuchung_GibtFehlerZurueck()
    {
        var (service, repo) = ErstelleService();
        // Bestehende Buchung die geändert werden soll: 08:00–09:00
        var zuAendern = ErstelleBestaetigteBuchung(id: "b-aendern", von: "08:00", bis: "09:00");
        // Andere bestehende Buchung: 10:00–11:00
        var andere = ErstelleBestaetigteBuchung(id: "b-andere", von: "10:00", bis: "11:00");
        repo.Seed(zuAendern);
        repo.Seed(andere);

        // Versuche auf 10:30–11:30 zu verschieben → Konflikt mit "b-andere"
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "10:30", Bis: "11:30");

        var (buchung, fehler) = service.Aendern(zuAendern.Id, request);

        Assert.Null(buchung);
        Assert.Equal("Zeitfenster ist bereits belegt.", fehler);
    }

    [Fact]
    public void Aendern_KonfliktNurMitSichSelbst_KeinFehler()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung(von: "09:00", bis: "10:00");
        repo.Seed(bestehend);
        // Verschieben auf überschneidende Zeit, aber nur die eigene Buchung ist im Raum
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "09:30", Bis: "10:30");

        var (buchung, fehler) = service.Aendern(bestehend.Id, request);

        Assert.Null(fehler);
        Assert.Equal("09:30", buchung!.Von);
    }

    [Fact]
    public void Aendern_KonfliktNurMitStornierterBuchung_KeinFehler()
    {
        var (service, repo) = ErstelleService();
        var zuAendern = ErstelleBestaetigteBuchung(id: "b-aendern", von: "08:00", bis: "09:00");
        var storniert = ErstelleBestaetigteBuchung(id: "b-storniert", von: "10:00", bis: "11:00");
        storniert.Status = BuchungStatus.Storniert;
        repo.Seed(zuAendern);
        repo.Seed(storniert);

        // Verschieben auf 10:00–11:00 → stornierte Buchung löst keinen Konflikt aus
        var request = new BuchungAendernRequest(Titel: null, Notiz: null, Datum: null, Von: "10:00", Bis: "11:00");

        var (buchung, fehler) = service.Aendern(zuAendern.Id, request);

        Assert.Null(fehler);
        Assert.NotNull(buchung);
    }

    // =========================================================================
    // Stornieren – Happy Path
    // =========================================================================

    [Fact]
    public void Stornieren_VorhandeneBuchung_SetztStatusAufStorniert()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung();
        repo.Seed(bestehend);

        var ergebnis = service.Stornieren(bestehend.Id);

        Assert.True(ergebnis);
        Assert.Equal(BuchungStatus.Storniert, repo.Laden(bestehend.Id)!.Status);
    }

    [Fact]
    public void Stornieren_VorhandeneBuchung_GibtTrueZurueck()
    {
        var (service, repo) = ErstelleService();
        var bestehend = ErstelleBestaetigteBuchung();
        repo.Seed(bestehend);

        Assert.True(service.Stornieren(bestehend.Id));
    }

    [Fact]
    public void Stornieren_BereitsStorniert_BleibStorniertUndGibtTrueZurueck()
    {
        var (service, repo) = ErstelleService();
        var storniert = ErstelleBestaetigteBuchung();
        storniert.Status = BuchungStatus.Storniert;
        repo.Seed(storniert);

        // Nochmals stornieren: nicht verboten, einfach idempotent
        var ergebnis = service.Stornieren(storniert.Id);

        Assert.True(ergebnis);
        Assert.Equal(BuchungStatus.Storniert, repo.Laden(storniert.Id)!.Status);
    }

    // =========================================================================
    // Stornieren – Fehlerfälle
    // =========================================================================

    [Fact]
    public void Stornieren_NichtVorhandeneBuchung_GibtFalseZurueck()
    {
        var (service, _) = ErstelleService();

        Assert.False(service.Stornieren("nicht-vorhanden"));
    }

    // =========================================================================
    // Integrationsscenario: nach Stornieren kein Konflikt mehr
    // =========================================================================

    [Fact]
    public void NachStornieren_NeuesBuchungImGleichenSlot_Moeglich()
    {
        var (service, repo) = ErstelleService();
        var (ersteB, _) = service.Anlegen(StandardAnlegen(von: "09:00", bis: "10:00"));
        Assert.NotNull(ersteB);

        service.Stornieren(ersteB.Id);

        // Gleicher Raum, gleicher Slot – jetzt wieder frei
        var (zweiteB, fehler) = service.Anlegen(StandardAnlegen(von: "09:00", bis: "10:00"));

        Assert.Null(fehler);
        Assert.NotNull(zweiteB);
    }
}
