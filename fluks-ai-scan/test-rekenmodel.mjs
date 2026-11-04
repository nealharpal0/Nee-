// Test van het rekenmodel van de fluks AI-scan.
// Gebruik: node test-rekenmodel.mjs   (exitcode 1 bij fouten)
// Leest het <script id="rekenmodel"> uit index.html, zodat er maar één bron van waarheid is.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "index.html"), "utf8");
const m = html.match(/<script id="rekenmodel">([\s\S]*?)<\/script>/);
if (!m) { console.error("FOUT: <script id=\"rekenmodel\"> niet gevonden in index.html"); process.exit(1); }

const ctx = {};
vm.createContext(ctx);
vm.runInContext(m[1] + "\nthis.AIScanModel = AIScanModel;", ctx);
const M = ctx.AIScanModel;

let fouten = 0, checks = 0;
const foutVoorbeelden = [];
function fout(msg, a) {
  fouten++;
  if (foutVoorbeelden.length < 20) foutVoorbeelden.push(msg + "  antwoorden=" + JSON.stringify(a));
}
function isGetal(x) { return typeof x === "number" && Number.isFinite(x); }

const vraag = (id) => M.VRAGEN.find((q) => q.id === id);
const opties = (id, s) => vraag(id).opties(s);
const ids = (id, s) => opties(id, s).map((o) => o.id);

// Softwarecombinaties: leeg (alleen "geen"), elk pakket los, alles
const SW_COMBIS = [["geen"], ["boekhouding"], ["offerte"], ["crm"], ["systeem"], ["boekhouding", "offerte"], ["boekhouding", "offerte", "crm", "systeem"]];

function controleer(a) {
  checks++;
  let r;
  try { r = M.calculate(a); } catch (e) { fout("Exceptie: " + e.message, a); return null; }

  const getallen = [r.laag, r.hoog, r.somLaag, r.somHoog, r.cap];
  if (!getallen.every(isGetal)) fout("NaN of oneindig in totaal", a);
  if (r.laag < 0 || r.hoog < 0) fout("Negatieve uitkomst", a);
  if (r.laag > r.hoog + 1e-9) fout("Ondergrens hoger dan bovengrens", a);
  if (r.hoog > r.cap + 1e-9) fout("Bovengrens boven cap", a);
  if (r.somLaag > r.somHoog + 1e-9) fout("Som laag > som hoog", a);

  for (const mod of r.modules) {
    for (const k of ["handmatig", "laag", "hoog", "midden", "aandeelLaag", "aandeelHoog"]) {
      if (!isGetal(mod[k])) fout(`NaN in module ${mod.id}.${k}`, a);
      if (mod[k] < 0) fout(`Negatief in module ${mod.id}.${k}`, a);
    }
    if (mod.aandeelHoog > 1 || mod.aandeelLaag > mod.aandeelHoog) fout(`Onlogisch aandeel in ${mod.id}`, a);
    if (mod.hoog > mod.handmatig + 1e-9) fout(`Besparing groter dan handwerk in ${mod.id}`, a);
    if (!mod.titel || !mod.uitleg) fout(`Ontbrekende tekst automatisering ${mod.id}`, a);
  }
  // Besparing mag nooit meer zijn dan het totale handwerk
  const handwerk = r.modules.reduce((s, x) => s + x.handmatig, 0);
  if (r.hoog > handwerk + 1e-9) fout("Besparing groter dan totaal handwerk", a);

  // Top 3
  if (r.top3.length > 3) fout("Top 3 bevat meer dan 3 items", a);
  const tids = r.top3.map((x) => x.id);
  if (new Set(tids).size !== tids.length) fout("Dubbele automatisering in top 3", a);
  for (let i = 1; i < r.top3.length; i++) if (r.top3[i].midden > r.top3[i - 1].midden) fout("Top 3 niet gesorteerd", a);

  // Weergave
  const w = r.weergave;
  if (!w || typeof w.tekst !== "string" || /NaN|undefined|Infinity|-\d/.test(w.tekst)) fout("Onjuiste weergavetekst: " + (w && w.tekst), a);
  if (w.laag > w.hoog) fout("Weergave laag > hoog", a);
  if (r.hoog >= 1 && (w.laag > r.laag + 1e-9 || w.hoog < r.hoog - 1e-9)) fout("Weergave dekt berekende bandbreedte niet", a);
  return r;
}

// 1. Volledig rooster: alle sectoren x alle opties x softwarecombinaties
const sectoren = M.SECTOR_OPTIES.map((s) => s.id);
for (const sector of sectoren) {
  for (const med of ids("medewerkers", sector))
  for (const intake of ids("intake", sector))
  for (const kanaal of ids("kanaal", sector))
  for (const vragen of ids("vragen", sector))
  for (const off of ids("offertes", sector))
  for (const fac of ids("facturen", sector))
  for (const plan of ids("planning", sector))
  for (const data of ids("data", sector))
  for (const sw of SW_COMBIS) {
    controleer({ sector, medewerkers: med, intake, kanaal, vragen, offertes: off, facturen: fac, planning: plan, data, software: sw });
  }
}

// 2. Monotonie: meer volume mag nooit tot minder besparing leiden
const MONO = ["medewerkers", "intake", "vragen", "offertes", "facturen", "data"];
const basis = (sector) => ({ sector, medewerkers: "m2", intake: "i2", kanaal: "tel", vragen: "q2", offertes: "o1", facturen: "f2", planning: "papier", data: "d2", software: ["geen"] });
for (const sector of sectoren) {
  for (const startMed of ids("medewerkers", sector)) {
    for (const veld of MONO) {
      const lijst = ids(veld, sector);
      let vorige = null;
      for (const o of lijst) {
        const a = { ...basis(sector), medewerkers: startMed, [veld]: o };
        const r = controleer(a);
        if (r && vorige) {
          if (r.laag < vorige.laag - 1e-9 || r.hoog < vorige.hoog - 1e-9) fout(`Niet monotoon in ${veld} (${o})`, a);
        }
        vorige = r;
      }
    }
  }
  // Meer handwerk per kanaal (online -> tel) mag niet minder besparing geven
  const kanaalVolgorde = ["online", "form", "chat", "tel"];
  let vorige = null;
  for (const k of kanaalVolgorde) {
    const a = { ...basis(sector), kanaal: k };
    const r = controleer(a);
    if (r && vorige && r.hoog < vorige.hoog - 1e-9) fout(`Niet monotoon in kanaal (${k})`, a);
    vorige = r;
  }
  // Meer software mag niet tot meer handwerk bij offertes/facturen leiden
  const zonder = controleer({ ...basis(sector), offertes: "o3", facturen: "f4", software: ["geen"] });
  const met = controleer({ ...basis(sector), offertes: "o3", facturen: "f4", software: ["boekhouding", "offerte"] });
  if (zonder && met) {
    const h = (r, id) => r.modules.find((x) => x.id === id).handmatig;
    if (h(met, "offertes") > h(zonder, "offertes")) fout("Offertepakket verhoogt handwerk", { sector });
    if (h(met, "facturatie") > h(zonder, "facturatie")) fout("Boekhoudpakket verhoogt handwerk", { sector });
  }
}

// 3. Uitersten: kleinste en grootste antwoorden per sector, met plausibiliteitsgrenzen
for (const sector of sectoren) {
  const eerste = (id) => ids(id, sector)[0];
  const laatste = (id) => ids(id, sector).at(-1);
  const min = { sector, medewerkers: eerste("medewerkers"), intake: eerste("intake"), kanaal: "online", vragen: eerste("vragen"), offertes: eerste("offertes"), facturen: eerste("facturen"), planning: "software", data: eerste("data"), software: ["boekhouding", "offerte", "crm", "systeem"] };
  const max = { sector, medewerkers: laatste("medewerkers"), intake: laatste("intake"), kanaal: "tel", vragen: laatste("vragen"), offertes: laatste("offertes"), facturen: laatste("facturen"), planning: "papier", data: laatste("data"), software: ["geen"] };
  const zzpMax = { ...max, medewerkers: "m1" };
  const rMin = controleer(min), rMax = controleer(max), rZzp = controleer(zzpMax);
  if (rMin && rMin.hoog > 3) fout(`Minimaal profiel geeft te veel besparing (${rMin.hoog.toFixed(1)} u)`, min);
  if (rMax && rMax.laag < 5) fout(`Maximaal profiel geeft te weinig besparing (${rMax.laag.toFixed(1)} u)`, max);
  if (rZzp && rZzp.hoog > 1 * 36 * 0.35 + 1e-9) fout("Zzp'er krijgt meer dan 35% van een werkweek", zzpMax);
  if (rMin && rMax && rMin.hoog >= rMax.hoog) fout("Minimaal profiel niet lager dan maximaal profiel", { sector });
  console.log(`${sector.padEnd(10)} min: ${rMin.weergave.tekst.padEnd(28)} max: ${rMax.weergave.tekst.padEnd(24)} zzp-max: ${rZzp.weergave.tekst}`);
}

// 4. Foutieve invoer moet een fout geven, geen stille NaN
for (const slecht of [{}, { sector: "onbekend" }, { ...basis("afspraak"), intake: "xx" }]) {
  checks++;
  let gegooid = false;
  try { const r = M.calculate(slecht); if (!isGetal(r.laag)) gegooid = true; } catch { gegooid = true; }
  if (!gegooid) fout("Ongeldige invoer gaf geen fout", slecht);
}

// 5. Teksten: elke sector heeft voor elke vraag een vraagtekst en opties
for (const sector of sectoren) for (const q of M.VRAGEN) {
  checks++;
  const t = q.vraag(sector), o = q.opties(sector);
  if (!t || /undefined/.test(t) || !o || o.length < 2) fout(`Vraag ${q.id} onvolledig voor ${sector}`, {});
}
if (M.VRAGEN.length < 8 || M.VRAGEN.length > 10) fout("Aantal vragen niet tussen 8 en 10", {});

console.log(`\n${checks} controles, ${fouten} fouten`);
if (fouten) { foutVoorbeelden.forEach((f) => console.error("  - " + f)); process.exit(1); }
console.log("OK: rekenmodel geslaagd");
