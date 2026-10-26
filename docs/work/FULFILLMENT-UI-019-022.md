# Personalflöde 019–022 — webb

2026-10-26. Ny meny Personalflöde · test visas enbart med fulfillment.read.test i det aktiva medlemskapet. TestFulfillment monteras med medlems-ID som key; byte av mandat avmonterar gamla orderdata. Komponentens generationskontroll ignorerar sena svar efter tenantbyte. API kontrollerar person, MFA och verksamhetsmandat separat.

## Funktion

- Explicit UUID-uppslag av accepterad testorder; ingen bred ordersökning eller klientskapad utlämningsrätt.
- Visar beställt, beständigt anspråk, bekräftat utlämnat, annullerat, returmottaget och kvarvarande per rad.
- Kontrollbeslut använder vald mängd, orsak och kontrollerad mottagarreferens.
- Beständigt testanspråk kräver godkänd kontroll. Väntande anspråk visas för separat bekräftelse; UI påstår ingen timeout-frigivning.
- Annullering gäller valda återstående rader; retur kopplas till bekräftat anspråk och ursprunglig orderrad.
- Returmottagning visar separat status, utan löfte om ekonomisk kredit, lagerförändring eller budgetfrigivning.
- Exakta positiva decimalsträngar används, högst sex decimaler. UI summerar inte pengar eller ekonomiska effekter.
- Samma request body/operation behåller idempotensnyckeln efter okänt/felat utfall. Efter framgång hämtas serverns tillstånd och revision.
- Strukturerade 503-fel ger tydligt fel utan optimistisk ändring. TEST_CANCELLATION_ENABLED är separat avstängd tills exakt migration godkänts och verifierats. Allt kräver testläge; inga verkliga varor får överlämnas.

## Verifiering

Slutlig `npm run verify` PASS: standard, typkontroll, 28 tester och produktionsbygge efter genererat API-kontrakt synkats. `git diff --check` PASS.

Chromium på produktionbygge, ny lokal port3619, `tests/e2e/fulfillment.cjs` PASS: kontroll → beständigt anspråk → bekräftelse, annullering av rest, fysisk testretur kopplad till anspråk/rad, testmärkning och idempotensheader. Avstängd annullering503 ändrar inte visat serverläge. Mobil390, mellan768 och desktop1440 utan horisontell scroll eller pageerrors.

Browserprovet använder kontrollerade API-svar och bevisar endast gränssnittet. Verkliga SQL-rolltester, mängdinvarianter, gate och samtidighet ägs av API-delarna. Ingen driftsatt browserresa eller faktisk ERP/utlämning påstås verifierad. Inga persistenta fixtures skapades.

## Filer

`src/app/test-fulfillment.tsx`, `src/app/test-return.tsx`, `src/lib/fulfillment.ts`, `tests/fulfillment.test.mjs`, `tests/e2e/fulfillment.cjs`; integration i workspace, proxy och globals.css. API-agenten äger genererad klient och kontraktslås.
