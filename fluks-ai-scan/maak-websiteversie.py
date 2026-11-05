"""Maakt website/scan.html uit index.html: dezelfde scan, maar het contactblok
verstuurt via het bestaande contactformulier van metfluks.nl (/api/contact).
Gebruik: python3 maak-websiteversie.py   (draai opnieuw na elke wijziging aan index.html)"""
import pathlib
hier = pathlib.Path(__file__).parent
s = (hier / "index.html").read_text(encoding="utf-8")

def vervang(oud, nieuw):
    global s
    assert s.count(oud) == 1, f"niet (uniek) gevonden: {oud[:60]!r}"
    s = s.replace(oud, nieuw)

# Logo linkt naar de eigen homepage
vervang('<a href="https://metfluks.nl" aria-label="fluks, naar de homepage">', '<a href="/" aria-label="fluks, naar de homepage">')

# Privacytekst: alleen het formulier verstuurt iets
vervang('''  <p><strong>Privacy:</strong> je antwoorden blijven in je eigen browser. Er is geen tracking, er worden geen cookies geplaatst, er wordt niets opgeslagen en niets verstuurd. Sluit je dit tabblad, dan zijn je antwoorden weg.</p>
  <p>Alleen het lettertype Lexend wordt geladen via Google Fonts. Kies je voor e-mail of WhatsApp, dan opent je eigen app met een conceptbericht; jij beslist of je dat verstuurt.</p>''',
'''  <p><strong>Privacy:</strong> je antwoorden blijven in je eigen browser. Er is geen tracking, er worden geen cookies geplaatst en er wordt niets opgeslagen. Sluit je dit tabblad, dan zijn je antwoorden weg.</p>
  <p>Alleen als je zelf het formulier "Plan een kennismaking" verstuurt, gaan je naam, bedrijf, contactgegevens en je uitkomst per e-mail naar fluks. Het lettertype Lexend wordt geladen via Google Fonts. Meer in de <a href="/privacy.html">privacyverklaring</a>.</p>''')

# Formulierstijlen
vervang('  .privacy { max-width', '''  .form { display: grid; gap: 16px; }
  .field { display: grid; gap: 4px; }
  .field label { font-weight: 500; }
  .field input, .field textarea {
    font: inherit; color: var(--navy); background: var(--surface);
    border: 1px solid var(--ink-muted); border-radius: var(--r-input);
    padding: 12px; min-height: 48px; width: 100%;
  }
  .field textarea { min-height: 120px; resize: vertical; }
  .field input:focus-visible, .field textarea:focus-visible { box-shadow: var(--focus); border-color: var(--navy); }
  [hidden] { display: none !important; }
  .gotcha { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
  .status-ok { background: var(--sky-soft); border-radius: var(--r-card); padding: 16px; }
  .privacy { max-width''')

# Contactgegevens: alleen nog WhatsApp (optioneel)
vervang('''var CONTACT_EMAIL = "";        // TODO: algemeen e-mailadres van fluks, bijv. "naam@domein.nl"
var WHATSAPP_NUMBER = "";      // TODO: WhatsApp-nummer in internationaal formaat zonder + of spaties, bijv. "316xxxxxxxx"''',
'''var WHATSAPP_NUMBER = "";      // TODO (optioneel): WhatsApp-nummer zonder + of spaties, bijv. "316xxxxxxxx". Leeg = geen WhatsApp-knop.
var CONTACT_ENDPOINT = "/api/contact";  // bestaand contactformulier van de site (Worker "fluks")''')

# Nieuw contactblok met formulier
start = s.index("  function contactBlok(r, sectorLabel) {")
eind = s.index("  render();\n})();")
s = s[:start] + r'''  function contactBlok(r, sectorLabel) {
    var samenvatting =
      "Ingevuld via de AI-scan (" + sectorLabel + ").\n" +
      "Geschatte tijdwinst: " + r.weergave.tekst + ".\n" +
      "Top 3: " + r.top3.map(function (m) { return m.titel; }).join("; ") + ".\n\n" +
      "Ik wil graag een kennismaking plannen.";
    var waOk = /^[0-9]{8,15}$/.test(WHATSAPP_NUMBER);
    return '<section class="contact stack" aria-labelledby="contact-titel" style="margin-top:16px">' +
      '<h2 id="contact-titel">Plan een kennismaking</h2>' +
      '<p>In een kennismaking kijken we samen welke automatisering bij jou als eerste zinvol is. Je uitkomst sturen we mee, zodat we goed voorbereid zijn.</p>' +
      '<form class="form" id="contact-form" novalidate>' +
        '<div class="field"><label for="cf-naam">Je naam</label><input id="cf-naam" name="naam" autocomplete="name" maxlength="100" required></div>' +
        '<div class="field"><label for="cf-bedrijf">Bedrijf</label><input id="cf-bedrijf" name="bedrijf" autocomplete="organization" maxlength="160" required></div>' +
        '<div class="field"><label for="cf-contact">Telefoon of e-mail</label><input id="cf-contact" name="contact" autocomplete="email" maxlength="160" required aria-describedby="cf-contact-hint"><span class="small muted" id="cf-contact-hint">Hierop nemen we contact met je op.</span></div>' +
        '<div class="field"><label for="cf-bericht">Bericht</label><textarea id="cf-bericht" name="bericht" maxlength="2000">' + esc(samenvatting) + '</textarea></div>' +
        '<input type="hidden" name="branche" value="' + esc(sectorLabel) + '">' +
        '<div class="gotcha" aria-hidden="true"><label for="cf-gotcha">Laat leeg</label><input id="cf-gotcha" name="_gotcha" tabindex="-1" autocomplete="off"></div>' +
        '<p class="error" id="cf-fout" role="alert" hidden></p>' +
        '<div class="btn-row">' +
          '<button type="submit" class="btn btn-primary" id="cf-verstuur">Verstuur aanvraag</button>' +
          (waOk ? '<a class="btn btn-secondary" href="https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent("Hallo fluks,\n\n" + samenvatting) + '" target="_blank" rel="noopener">WhatsApp<span class="sr-only"> (opent in nieuw venster)</span></a>' : '') +
        '</div>' +
      '</form>' +
      '<div class="status-ok" id="cf-ok" role="status" tabindex="-1" hidden><strong>Je aanvraag is verstuurd.</strong> We nemen contact met je op via de gegevens die je hebt ingevuld.</div>' +
    '</section>';
  }

  function koppelContactformulier() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var fout = document.getElementById("cf-fout");
    var knop = document.getElementById("cf-verstuur");
    function toon(t, veld) {
      fout.textContent = t; fout.hidden = false;
      if (veld) document.getElementById(veld).focus();
    }
    form.addEventListener("input", function () { fout.hidden = true; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fout.hidden = true;
      var naam = form.naam.value.trim(), bedrijf = form.bedrijf.value.trim(), contact = form.contact.value.trim();
      if (!naam) return toon("Vul je naam in.", "cf-naam");
      if (!bedrijf) return toon("Vul de naam van je bedrijf in.", "cf-bedrijf");
      var isMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      var isTel = /^[+()\d\s.-]+$/.test(contact) && contact.replace(/\D/g, "").length >= 8;
      if (!isMail && !isTel) return toon("Vul een geldig telefoonnummer of e-mailadres in.", "cf-contact");
      knop.disabled = true; knop.textContent = "Bezig met versturen…";
      fetch(CONTACT_ENDPOINT, { method: "POST", body: new FormData(form) })
        .then(function (res) { return res.json().catch(function () { return { ok: false }; }); })
        .then(function (data) {
          if (data && data.ok) {
            form.hidden = true;
            var ok = document.getElementById("cf-ok"); ok.hidden = false; ok.focus();
          } else if (data && data.error === "invalid") {
            toon("Controleer je naam, bedrijf en telefoonnummer of e-mailadres.", "cf-naam");
          } else {
            toon("Versturen lukte niet. Probeer het later nog eens, of neem contact op via de homepage.");
          }
        })
        .catch(function () { toon("Versturen lukte niet. Controleer je internetverbinding en probeer het opnieuw."); })
        .then(function () { knop.disabled = false; knop.textContent = "Verstuur aanvraag"; });
    });
  }

''' + s[eind:]

# Formulier koppelen na het tonen van de uitkomst
vervang('''    screen.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    });''', '''    koppelContactformulier();''')

(hier / "website" / "scan.html").write_text(s, encoding="utf-8")
print("website/scan.html geschreven")
