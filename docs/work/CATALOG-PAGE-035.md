# CATALOG-PAGE-035 — Sökning och sidvisning i artikelregistret

2026-10-26. Webbens artikelregister hämtar `standalone-catalog/page` med tenant, explicit inskickad q, limit=50 och nyckelmarkör after_sku/after_id. API-responsen används för items, total och nästa markör. Föregående-knappen använder en stack med tidigare sidors startmarkörer. Ändrad söktext aktiveras först vid Sök i hela registret och återgår då till första sidan.

Varje ny hämtning rensar tidigare rader, antal och nästa markör. Sekvensnummer, aktuell tenant och unmount-kontroll avvisar sena svar. Osparat artikelformulär lämnas oförändrat vid sökning/sidbyte/uppdatering. Artikelbyte använder befintlig kasta-draft-bekräftelse. Byte av tenant återställer formuläret. Importens onChanged läser om aktuell sida och behåller inskickad sökning. Manuellt spara/bulkimport behåller separata lås och parent onBusyChange.

Den här agenten har inte kört bygge/publicering; parent verifierar med sammanfört API035 och kontrakt. Parent äger exportkomponent och integrerar synliga items vid behov. Verifiering bör omfatta fler än 200 artiklar, exakta SKU-markörer, framåt/bakåt, q-reset, tomt resultat, sena svar och bevarad draft.
