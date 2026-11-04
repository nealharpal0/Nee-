# Onderbouwing rekenmodel AI-scan

Geraadpleegd op 2026-11-04. **Beperking:** pagina's openen (WebFetch) werkte vannacht niet: elk domein gaf een DNS-fout in deze cloudsessie. Alle bronnen hieronder zijn daarom alleen via de zoekmachine (WebSearch) gevonden en gecontroleerd. De cijfers komen uit zoekresultaten, niet uit de volledige pagina. Controleer ze in de bron voordat je ze naar buiten gebruikt.

Legenda: **[bron]** = getal komt uit een bron · **[afgeleid]** = gebaseerd op een bron, maar door mij vertaald naar dit model · **[schatting]** = aanname van fluks zonder harde bron.

## 1. Wat de bronnen wel zeggen

| # | Bevinding (eigen woorden) | Bron | Kwaliteit |
| --- | --- | --- | --- |
| B1 | Het technisch automatiseringspotentieel van activiteiten is het hoogst bij voorspelbaar fysiek werk (81%), daarna data verwerken (69%) en data verzamelen (64%). Volledige automatisering van een beroep is zeldzaam; bij ongeveer 60% van de beroepen is minstens 30% van de activiteiten te automatiseren. Of het percentage over gewerkte tijd gaat, kon ik niet volledig bevestigen (een presentatie van MGI zet het naast "time spent"). | McKinsey Global Institute, *A future that works* (2017): https://www.mckinsey.com/~/media/mckinsey/featured%20insights/digital%20disruption/harnessing%20automation%20for%20a%20future%20that%20works/mgi-a-future-that-works-in-brief.pdf | Gezaghebbend, wel Amerikaans, uit 2017 en over *technisch* potentieel, niet wat in de praktijk lukt |
| B2 | Sms-herinneringen verbeteren de opkomst bij afspraken ten opzichte van geen herinnering, en werken ongeveer even goed als een herinnering per telefoon. Cochrane-review van 7 studies (ongeveer 5.800 deelnemers), bewijskracht laag tot matig. | Gurol-Urganci e.a., Cochrane review (2013): https://pubmed.ncbi.nlm.nih.gov/24310741/ | Goed, maar zorgsector |
| B3 | Een tweede meta-analyse concludeert ook dat sms-herinneringen de kans op opkomst duidelijk vergroten. | Guy e.a. (2012): https://pmc.ncbi.nlm.nih.gov/articles/PMC3419880/ | Goed, zorgsector |
| B4 | Een deel van de ondernemers besteedt 10 tot 25% van de tijd aan administratie. Ondernemers die cloudsoftware gebruiken, zeggen meer dan 3 uur per week te besparen op hun administratie. | Persbericht onderzoek Appwiki, via MT Sprout: https://mtsprout.nl/persbericht/ondernemer-heeft-nog-veel-kansen-om-tijd-te-winnen | Matig: persbericht, methode onbekend |
| B5 | Ondernemers in het MKB werken gemiddeld ongeveer 54 uur per week; daarnaast kost administratie voor de overheid gemiddeld ongeveer 2,5 uur per week. | EIM-onderzoek, via MT Sprout: https://mtsprout.nl/leiderschap/management/ondernemer-werkt-54-uur | Matig: ouder onderzoek, secundaire bron |
| B6 | Een offerte van vier à vijf onderdelen is volgens een gebruiker van offertesoftware binnen een half uur klaar. | Vakblad De Hovenier: https://www.vakbladdehovenier.nl/upload/artikelen/dh219timinsystems.pdf | Zwak: één gebruiker, commercieel |
| B7 | Een papieren factuur vervangen door een e-mailfactuur bespaart volgens een studie gemiddeld ongeveer €2,42 per factuur; een gestructureerde e-factuur ongeveer €3,24. | Universiteit Hasselt (DAV-studie): https://documentserver.uhasselt.be/bitstream/1942/29325/1/f073b59b-2e8b-4740-a221-4a4389cfb3e5.pdf | Redelijk, Belgisch |
| B8 | In 2024 gebruikte 22,7% van de Nederlandse bedrijven met 10 of meer werkzame personen minstens één AI-technologie; grote bedrijven vaker dan kleine. | CBS, AI-monitor 2024: https://www.cbs.nl/nl-nl/longread/aanvullende-statistische-diensten/2025/ai-monitor-2024/samenvatting | Goed (context, niet gebruikt in de berekening) |
| B9 | Volgens een boekingsplatform werd 60% van de online geboekte kappersafspraken buiten de openingstijden gemaakt. | BarberBooking-persbericht (2016) via Emerce: https://www.emerce.nl/wire/mijlpaal-3000000-online-afspraken-via-barberbooking | Zwak: zelfpromotie, oud (context voor de uitleg, niet in de berekening) |

Niet gevonden (niet geverifieerd): onafhankelijk Nederlands onderzoek naar (a) minuten per telefonische afspraak, (b) tijd per offerte per branche, (c) tijd per klantvraag, (d) planningstijd per medewerker. Dat zijn in het model dus schattingen.

## 2. Kentallen in het model

| Kental (in `index.html`) | Waarde | Status | Toelichting |
| --- | --- | --- | --- |
| Antwoordbandbreedtes | midden van de bandbreedte (bijv. "6 tot 15" = 10) | [schatting] | Bij "meer dan X" ongeveer 1,3 tot 1,5 keer X. |
| `kanaalMinuten` | telefoon 8, e-mail/WhatsApp 5, formulier 3, online 1 min per afspraak/order | [schatting] | Telefoon: gesprek, agenda erbij en vaak terugbellen. Geen bron gevonden. |
| `intakeFactor` per sector | afspraak 1,0 · dienstverlener 1,5 · tuinbouw 1,2 · logistiek 1,3 | [schatting] | Een opdracht, order of rit heeft meer gegevens dan een kappersafspraak. |
| `vraagMinuten` | 4 min (logistiek 5) | [schatting] | Statusvragen in transport vragen opzoekwerk. |
| `offerteMinuten` | afspraak 20 · dienstverlener 45 · tuinbouw 25 · logistiek 30 | [afgeleid] van B6 | B6 noemt circa 30 min voor een eenvoudige offerte; installateurs en aannemers hebben vaak opname en calculatie. |
| `offertePakketFactor` | 0,5 | [schatting] | Met software is een offerte grotendeels hergebruik. |
| `factuurMinuten` | 10 zonder, 6 met boekhoudprogramma (incl. herinneren) | [schatting], richting [afgeleid] van B7 | B7 laat zien dat digitaal factureren per factuur geld bespaart, maar geeft geen minuten. |
| `planningBasis` | papier 0,8 · Excel 0,5 · software 0,25 uur per week, × fte^0,75 | [schatting] | De exponent 0,75 zorgt dat planning minder dan lineair groeit met het aantal mensen. |
| `planningFactor` | tuinbouw 1,2 · logistiek 1,5 | [schatting] | Ritplanning en oogst-/leverplanning zijn complexer. |
| `aandeel` intake | 35–65% | [schatting] | Online boeken of orders inlezen vervangt veel, maar niet alles (uitzonderingen, wijzigingen). |
| `aandeel` vragen | 25–50% | [afgeleid] van B2/B3 | Herinneringen en statusberichten voorkomen een deel van de vragen en no-shows; de effecten in de zorg zijn duidelijk maar niet één-op-één over te zetten. |
| `aandeel` offertes | 30–60% | [schatting] | Sjablonen en automatische opvolging. |
| `aandeel` facturatie | 40–70% | [afgeleid] van B1 | B1: data verwerken 69% technisch te automatiseren; bovengrens daarop gezet. |
| `aandeel` planning | 20–45% | [schatting] | Planning blijft mensenwerk; software ondersteunt. |
| `aandeel` data-invoer | 40–70% (+5 procentpunt bij 2+ pakketten) | [afgeleid] van B1 | B1: data verzamelen 64% en verwerken 69%. Bovengrens net daaronder, omdat technisch potentieel meer is dan wat bij een MKB'er in de praktijk lukt. |
| Software "online systeem" | halveert aandeel intake | [schatting] | Wie al online boekt, heeft minder te winnen. |
| `werkurenPerFte` | 36 uur | [schatting] | B5 laat zien dat ondernemers zelf meer werken; 36 is bewust voorzichtig. |
| `maxAandeelWerktijd` | 35% (ondergrens maximaal 60% hiervan) | [afgeleid] van B1 en B4 | B4: 10–25% van de tijd gaat naar administratie; B1: ongeveer 30% van de activiteiten in veel beroepen is te automatiseren. 35% van alle werktijd is dus een ruime bovengrens. |

## 3. Hoe de berekening werkt

1. Per onderdeel: handwerk per week = volume × minuten per stuk ÷ 60 (planning en data-invoer: direct in uren).
2. Besparing = handwerk × automatiseerbaar aandeel, als bandbreedte laag–hoog.
3. Totaal = som van de onderdelen, begrensd op 35% van de werktijd van het team (de ondergrens op 60% daarvan).
4. Weergave: ondergrens naar beneden en bovengrens naar boven afgerond op hele uren (vanaf 20 uur op vijftallen). Onder de 1 uur: "minder dan 1 uur per week".
5. Top 3: de drie onderdelen met de grootste verwachte besparing (midden van de bandbreedte), mits minstens een kwartier per week.

`test-rekenmodel.mjs` rekent ruim 1,7 miljoen combinaties door (alle sectoren × alle antwoorden × 7 softwarecombinaties). De test controleert op NaN, negatieve waarden, ondergrens boven bovengrens, besparing groter dan het handwerk, overschrijding van de grens, sortering van de top 3, en of meer volume nooit tot minder besparing leidt.

## 4. Advies

- Leg de kentallen naast 3 tot 5 echte klantsituaties en stel ze bij. Vooral `kanaalMinuten` en `offerteMinuten` bepalen de uitkomst.
- Gebruik op de pagina geen bronclaims die je niet zelf in de originele bron hebt gelezen.
