# Samenvatting nachtwerk fluks AI-scan (4–5 november 2026)

## Wat er ligt
| Bestand | Inhoud | Status |
| --- | --- | --- |
| `index.html` | AI-scan: 10 vragen (vraag 1 = sector), voortgangsbalk, terugknop, uitkomst als bandbreedte, top 3 automatiseringen, uitklapblok "Zo rekenen we", contactblok, privacytekst | Werkt; getest op 375 en 1280 px en met alleen toetsenbord |
| `test-rekenmodel.mjs` | Rekent ruim 1,7 miljoen combinaties door (alle sectoren × alle antwoorden) | Geslaagd: 0 fouten |
| `onderbouwing.md` | Kentallen per stuk gemarkeerd als bron, afgeleid of schatting, met URL's | Klaar; de meeste kentallen zijn schattingen |
| `screenshots/` | 10 screenshots op 375 en 1280 px; mobiele tabel en kop daarna verbeterd | Klaar |
| `README.md` + `wrangler.jsonc` | 5 stappen om de pagina via Workers static assets te publiceren | Klaar, niet zelf gedeployd |
| `leads.csv` | 40 bedrijven (10 per sector), puntkomma als scheidingsteken, UTF-8 | 15× A, 18× B, 7× C |
| `leads.md` | Top 10 met onderbouwing, plus regels voor e-mail, telefoon en LinkedIn | Klaar |

## Aannames
- **Tien vragen**: sector, medewerkers, volume, kanaal, klantvragen, offertes, facturen, planning, overtypen en software. De vraag "waar loop je op vast" heb ik weggelaten om binnen 10 te blijven.
- **Rekenmodel**: uitkomst begrensd op 35% van de werktijd van het team. Antwoorden in een bandbreedte rekenen met het midden. Bij "Online systeem" halveert de winst op binnenkomst.
- **Contactknoppen** zijn grijs zolang `CONTACT_EMAIL` en `WHATSAPP_NUMBER` leeg zijn. Het mail- en WhatsApp-bericht bevat de uitkomst, maar de bezoeker verstuurt het zelf.
- **Deployen**: de pagina gaat via een aparte map `public/` online, zodat `leads.csv` nooit mee gepubliceerd wordt.
- **Leads**: geen 06-nummers en geen namen opgenomen. Telefoon alleen bij een vast algemeen nummer, e-mail alleen bij info@ of een vergelijkbaar algemeen adres. "Logistiek" heb ik breed opgevat: ook verhuizers, koeriers en opslag.
- Pagina's die ouder waren of elkaar tegenspraken heb ik opgenomen met een opmerking, niet weggelaten.

## Open punten
1. **WebFetch werkte niet.** Elk domein gaf een DNS-fout, ook bij directe toegang via curl, omdat het netwerkbeleid van deze cloudomgeving uitgaand verkeer blokkeert. Alle bronnen, websites en leads zijn daarom alleen via WebSearch (de zoekmachine-index) gecontroleerd, niet live geopend. Je kunt dit aanpassen in de omgevingsinstellingen, onder Network access: https://code.claude.com/docs/en/cloud-environments#network-access
2. Of de 40 bedrijven actief zijn en wat hun rechtsvorm is, staat niet in het KvK-register gecontroleerd. De rechtsvorm bepaalt of je mag mailen of bellen (zie `leads.md`).
3. Over de uitzondering in art. 11.7 Telecommunicatiewet voor zakelijke e-mail spreken bronnen elkaar tegen. Ik heb alleen een zoeksamenvatting van de wettekst kunnen lezen.
4. De kentallen in het model zijn grotendeels schattingen. Er bestaat geen Nederlands onderzoek naar minuten per telefonische afspraak of per offerte.
5. Niet gedaan: echt deployen op Cloudflare, en een externe toegankelijkheidsaudit. Contrast en toetsenbord heb ik wel zelf gecontroleerd.

## Controleer dit eerst
1. **Open `index.html`** en doorloop de scan één keer voor je eigen sector. Kijk of de uitkomst geloofwaardig voelt. Pas zo nodig `kanaalMinuten` en `offerteMinuten` aan in het blok bovenaan het script, en draai daarna `node test-rekenmodel.mjs`.
2. **Vul `CONTACT_EMAIL` en `WHATSAPP_NUMBER` in.**
3. **Lees `leads.md`, het deel "Wat mag er"**, en zoek voor de top 10 de rechtsvorm op in het KvK-register voordat je iemand benadert.
4. Open de sites van de top 10 zelf even, omdat ik ze niet live heb kunnen bekijken.
