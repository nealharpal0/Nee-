# fluks AI-scan

Eén zelfstandige pagina (`index.html`). CSS en JavaScript zitten in het bestand; alleen het lettertype Lexend komt van Google Fonts. Lokaal bekijken: open `index.html` in je browser.

Overige bestanden:

| Bestand | Wat |
| --- | --- |
| `test-rekenmodel.mjs` | Test van het rekenmodel: `node test-rekenmodel.mjs` (Node 18 of hoger) |
| `onderbouwing.md` | Kentallen en bronnen |
| `screenshots/` | Pagina op 375 en 1280 px breed |
| `leads.csv`, `leads.md` | Leadlijst (intern, **niet publiceren**) |
| `wrangler.jsonc` | Cloudflare-configuratie, publiceert alleen de map `public/` |

## Vóór publicatie

Vul bovenaan het tweede `<script>`-blok in `index.html` deze twee variabelen in:

```js
var CONTACT_EMAIL = "";     // TODO
var WHATSAPP_NUMBER = "";   // TODO, internationaal formaat zonder + en spaties
```

Zolang ze leeg zijn, zijn de contactknoppen grijs en staat er een melding onder.

## Op Cloudflare zetten (Workers static assets) in 5 stappen

1. **Zet de pagina in een aparte map.** In de map `fluks-ai-scan/`:
   `mkdir -p public && cp index.html public/index.html`
   Zo komen de leadlijst en de andere interne bestanden niet online. `wrangler.jsonc` wijst al naar `./public`.
2. **Controleer `wrangler.jsonc`.** Pas `name` aan als je wilt (dat wordt `<name>.<jouw-subdomein>.workers.dev`). Er is geen Worker-script nodig: bij een puur statische site is `assets.directory` genoeg.
3. **Log in en publiceer:** `npx wrangler login` en daarna `npx wrangler deploy`. Je krijgt een `workers.dev`-adres om te testen.
4. **Koppel je domein.** Haal in `wrangler.jsonc` de `//` weg voor het `routes`-blok (bijvoorbeeld `scan.metfluks.nl` met `"custom_domain": true`) en draai opnieuw `npx wrangler deploy`. Cloudflare maakt dan zelf het DNS-record en het certificaat aan. Dat kan ook via het dashboard: Workers & Pages, je Worker, Settings, Domains & Routes, Add, Custom Domain. Let op: op een hostnaam waar al een CNAME-record staat lukt dit niet.
5. **Controleer** het adres op je telefoon en op je laptop: één keer de scan doorlopen, en kijken of de contactknoppen werken.

**Liever onder een pad op je bestaande site** (bijv. `metfluks.nl/scan`)? Draait metfluks.nl zelf ook op Workers static assets, zet dan `index.html` als `scan/index.html` in de assets-map van die site en deploy die. Draait de site ergens anders, dan kan een Worker op een route (`metfluks.nl/scan*`) met `assets.base_path` = `/scan` (vanaf Wrangler 4.148.0). Dat heb ik niet getest.

Bronnen (Cloudflare-documentatie, geraadpleegd 2026-11-04 via de zoekfunctie van de Cloudflare-docs; de pagina's zelf kon ik niet openen):
- Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Configuration and Bindings (`assets.directory`): https://developers.cloudflare.com/workers/static-assets/binding/
- Workers Best Practices (statische site zonder Worker-script): https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- Custom Domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Static Assets base path (changelog 28-10-2026): https://developers.cloudflare.com/changelog/post/2026-10-28-static-assets-base-path/
