using CalvinBookingService.Domain;

namespace CalvinBookingService.Tests.Domain;

public class ZeitfensterTests
{
    // -------------------------------------------------------------------------
    // AlsMinuten – Happy Path
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("00:00", 0)]
    [InlineData("00:01", 1)]
    [InlineData("09:00", 540)]
    [InlineData("10:30", 630)]
    [InlineData("12:00", 720)]
    [InlineData("23:59", 1439)]
    public void AlsMinuten_GueltigesFormat_GibtMinutenZurueck(string hhmm, int erwartet)
    {
        Assert.Equal(erwartet, Zeitfenster.AlsMinuten(hhmm));
    }

    // -------------------------------------------------------------------------
    // AlsMinuten – Edge Cases / ungültige Eingaben → null
    // -------------------------------------------------------------------------

    [Fact]
    public void AlsMinuten_Null_GibtNullZurueck()
    {
        Assert.Null(Zeitfenster.AlsMinuten(null));
    }

    [Fact]
    public void AlsMinuten_LeerString_GibtNullZurueck()
    {
        Assert.Null(Zeitfenster.AlsMinuten(""));
    }

    [Fact]
    public void AlsMinuten_NurLeerzeichen_GibtNullZurueck()
    {
        Assert.Null(Zeitfenster.AlsMinuten("   "));
    }

    [Theory]
    [InlineData("9:00")]      // fehlende führende Null → ungültig
    [InlineData("09:0")]      // fehlende Minute-Null
    [InlineData("9:0")]       // beide fehlenden Nullen
    [InlineData("25:00")]     // Stunde > 23
    [InlineData("12:60")]     // Minute > 59
    [InlineData("abc")]       // kein Zeitformat
    [InlineData("09-00")]     // falsches Trennzeichen
    [InlineData("0900")]      // kein Trennzeichen
    [InlineData("09:00:00")]  // Sekunden angegeben
    public void AlsMinuten_UngueltigesFormat_GibtNullZurueck(string hhmm)
    {
        Assert.Null(Zeitfenster.AlsMinuten(hhmm));
    }

    // -------------------------------------------------------------------------
    // IstGueltigesDatum – Happy Path
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("2026-06-18")]
    [InlineData("2026-01-01")]
    [InlineData("2026-12-31")]
    [InlineData("2000-02-29")] // Schaltjahr
    public void IstGueltigesDatum_GueltigesDatum_GibtTrueZurueck(string datum)
    {
        Assert.True(Zeitfenster.IstGueltigesDatum(datum));
    }

    // -------------------------------------------------------------------------
    // IstGueltigesDatum – Edge Cases / ungültige Eingaben → false
    // -------------------------------------------------------------------------

    [Fact]
    public void IstGueltigesDatum_Null_GibtFalseZurueck()
    {
        Assert.False(Zeitfenster.IstGueltigesDatum(null));
    }

    [Fact]
    public void IstGueltigesDatum_LeerString_GibtFalseZurueck()
    {
        Assert.False(Zeitfenster.IstGueltigesDatum(""));
    }

    [Fact]
    public void IstGueltigesDatum_NurLeerzeichen_GibtFalseZurueck()
    {
        Assert.False(Zeitfenster.IstGueltigesDatum("   "));
    }

    [Theory]
    [InlineData("18.06.2026")]   // deutsches Format
    [InlineData("06/18/2026")]   // US-Format
    [InlineData("2026-6-18")]    // fehlende führende Null im Monat
    [InlineData("2026-06-1")]    // fehlende führende Null im Tag
    [InlineData("2026-13-01")]   // Monat > 12
    [InlineData("2026-00-01")]   // Monat 0
    [InlineData("2026-06-00")]   // Tag 0
    [InlineData("2026-06-32")]   // Tag > 31
    [InlineData("2100-02-29")]   // kein Schaltjahr (2100 ist durch 100, nicht durch 400 teilbar)
    [InlineData("abc")]          // kein Datum
    public void IstGueltigesDatum_UngueltigesDatum_GibtFalseZurueck(string datum)
    {
        Assert.False(Zeitfenster.IstGueltigesDatum(datum));
    }

    // -------------------------------------------------------------------------
    // Ueberlappt – Happy Path (echte Überschneidungen)
    // -------------------------------------------------------------------------

    [Fact]
    public void Ueberlappt_VollstaendigeUeberschneidung_GibtTrueZurueck()
    {
        // a: 09:00–11:00, b: 10:00–12:00 → Überschneidung 10:00–11:00
        Assert.True(Zeitfenster.Ueberlappt(540, 660, 600, 720));
    }

    [Fact]
    public void Ueberlappt_AEnthaeltB_GibtTrueZurueck()
    {
        // a: 09:00–12:00, b: 10:00–11:00
        Assert.True(Zeitfenster.Ueberlappt(540, 720, 600, 660));
    }

    [Fact]
    public void Ueberlappt_BEnthaeltA_GibtTrueZurueck()
    {
        // a: 10:00–11:00, b: 09:00–12:00
        Assert.True(Zeitfenster.Ueberlappt(600, 660, 540, 720));
    }

    [Fact]
    public void Ueberlappt_GleicheZeiten_GibtTrueZurueck()
    {
        // a = b: 09:00–10:00
        Assert.True(Zeitfenster.Ueberlappt(540, 600, 540, 600));
    }

    // -------------------------------------------------------------------------
    // Ueberlappt – kein Konflikt (aneinandergrenzen oder getrennt)
    // -------------------------------------------------------------------------

    [Fact]
    public void Ueberlappt_ExaktAneinandergrenzend_GibtFalseZurueck()
    {
        // a: 09:00–10:00, b: 10:00–11:00 → KEIN Konflikt (halboffene Intervalle)
        Assert.False(Zeitfenster.Ueberlappt(540, 600, 600, 660));
    }

    [Fact]
    public void Ueberlappt_ExaktAneinandergrenzendUmgekehrt_GibtFalseZurueck()
    {
        // a: 10:00–11:00, b: 09:00–10:00 → KEIN Konflikt
        Assert.False(Zeitfenster.Ueberlappt(600, 660, 540, 600));
    }

    [Fact]
    public void Ueberlappt_AVorB_GibtFalseZurueck()
    {
        // a: 08:00–09:00, b: 10:00–11:00 → kein Konflikt
        Assert.False(Zeitfenster.Ueberlappt(480, 540, 600, 660));
    }

    [Fact]
    public void Ueberlappt_ANachB_GibtFalseZurueck()
    {
        // a: 10:00–11:00, b: 08:00–09:00 → kein Konflikt
        Assert.False(Zeitfenster.Ueberlappt(600, 660, 480, 540));
    }
}
