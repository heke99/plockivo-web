# CATALOG-EXPORT-037 — export av aktuell sida

CSV-export implementerad som ren funktion `catalogPageCsv` och komponent `CatalogExport`. Komponenten tar endast redan behörighetskontrollerade `StandaloneCatalogItem`-rader från aktuell sida och disabled-status; den hämtar ingen ytterligare data. Huvudagenten äger inkopplingen i katalogvyn.

Kolumnerna matchar importformatets ordning: sku, name, unit, price_sek, vat_percent, barcode, quantity_step, package_quantity. UTF-8 BOM, semikolon, CRLF och citerade celler med dubblerade citattecken. Ören konverteras med BigInt; decimalmängder ändras inte. Moms bevaras exakt som procent, inklusive bråkdelar. Befintlig importer stöder endast 0/6/12/25 %, så andra momssatser exporteras korrekt men måste anpassas före återimport. Exporten inkluderar inte ID, aktivering eller självskanningsval, och återimport är därför inte en fullständig återställning.

Textfält med inledande = + - @, även efter whitespace, kontroll- eller formattecken, prefixas med apostrof för kalkylbladssäkerhet. Apostrofen är avsiktlig data och tas inte automatiskt bort vid återimport. Detta kan också öka fältlängden för en maximalt lång sträng. Formelliknande och felaktiga tal i numeriska kolumner avvisas; ingen formelneutralisering används för att dölja ogiltiga numeriska data.

Blob-URL skapas endast vid explicit klick, den temporära länken tas bort direkt och URL återkallas efter fem sekunder eller vid unmount. Inga data skickas till extern tjänst.

Riktad verifiering: `node --experimental-strip-types --test tests/catalog-export.test.mjs` — 5 PASS. Kontroller: begränsad sidmängd, exakta belopp, standardmoms återimport, citat/newline/UTF-8, farliga textprefix inklusive whitespace/kontroller, icke-standardmoms och ogiltiga numeriska värden. Ingen build/publicering av delagenten. Browsernedladdning/OS-kalkylblad återstår för huvudagentens UI-prov.
