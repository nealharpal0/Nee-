# AI-scan op metfluks.nl zetten

`scan.html` is de websiteversie van de AI-scan. Er zijn twee verschillen met `../index.html`:
- De knop **Plan een kennismaking** is een formulier dat verstuurt via het bestaande contactformulier van de site (`/api/contact` in de Worker `fluks`). De aanvraag komt binnen zoals elke andere aanvraag via de site: in het veld Branche staat de sector, en in het bericht de uitkomst van de scan.
- Het logo linkt naar `/` en de privacytekst verwijst naar `/privacy.html`.

Deze versie maak je opnieuw met `python3 ../maak-websiteversie.py`. Doe dat na elke wijziging aan `index.html`.

## In 4 stappen live

Doe dit in de map van je website, waar `wrangler.jsonc`, `src/worker.js` en `dist/` staan.

1. **Kopieer** `scan.html` naar `dist/scan.html`.
2. **Optioneel: WhatsApp.** Vul in `dist/scan.html` bovenaan het tweede script `WHATSAPP_NUMBER` in (bijvoorbeeld `"316xxxxxxxx"`). Blijft het leeg, dan is er geen WhatsApp-knop.
3. **Link vanaf je homepage**, bijvoorbeeld in de hero of bij je diensten:
   ```html
   <a class="btn btn-primary" href="/scan.html">Doe de AI-scan (2 minuten)</a>
   ```
   Gebruik de knopklassen van je eigen homepage.
4. **Publiceer** met `npx wrangler deploy`. Controleer daarna:
   - https://metfluks.nl/scan.html laadt;
   - na het doorlopen van de scan komt een testaanvraag aan in je mailbox (`MAIL_TO`).

## Waarom `/scan.html` en niet `/scan`
Je Worker serveert bestanden letterlijk (`html_handling: "none"`, zoals bij `/privacy.html`). Wil je toch `/scan`, voeg dan in `src/worker.js` vóór de laatste regel toe:
```js
if (pathname === '/scan') return env.ASSETS.fetch(new Request(new URL('/scan.html', request.url), request));
```

## Getest
In een headless browser, met een nagebootste `/api/contact`:
- de verplichte velden worden gecontroleerd;
- de verstuurde velden zijn `naam`, `bedrijf`, `contact`, `bericht`, `branche` en `_gotcha`, dezelfde als die je Worker verwacht;
- na een geslaagde verzending verschijnt een bevestiging;
- bij een fout van de server verschijnt een duidelijke melding.

Niet getest: verzenden via je echte Worker en mailserver.
