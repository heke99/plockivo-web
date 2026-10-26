# PRODUCTION-RECEIVABLES-055 — Manuell betalningsavstämning

2026-10-26. Ny ProductionReceivables(orderId,disabled?,onBusyChange?) läser skyddad production/orders/:id/receivables och registrerar hel-/delbetalning via /payments eller spårbar helåterföring av vald registrering via /payments/reverse. Endast fulfilled och merchant_admin med production.receivables.manage renderas i både personlig order och personalens orderkö. Köpare och butikspersonal saknar komponenten; servern måste verkställa motsvarande skydd.

Belopp använder kronorToMinor/minorToKronor utan flyttal. Betalning ska vara positiv och högst serverns balance_minor. Krav: betalningsreferens1..120, underlag1..200, motivering10..500; återföring använder receipt_id för ej redan återförd registrering plus underlag/motivering. Fyll-i-restbelopp-knappen ändrar bara formuläret. Båda mutationerna kräver uttrycklig bekräftelse om manuell avstämning. UI påstår ingen banköverföring, bankåterbetalning, fakturering, retur eller varukreditering.

Fast UUID-idempotens per serialiserad payload i minnet. Timeout/okänt utfall bevarar key och hela respektive draft. Versionskonflikt stänger skrivning tills explicit uppdatering, utan att kasta formulär. Svar måste bekräfta samma order/mode/manual_reconciliation och version; därefter läses aktuellt ledger igen. Bekräftad mutation kan tömma endast sitt framgångsrikt sparade formulär, aldrig det andra osparade formuläret. Saldon gäller hela ordern, eventuell receipts_truncated markeras som senaste100 historikrader.

Busy når genom ProductionOrder/Queue till workspace för navigationslås; andra orderläsningar/exporthämtningar låses under betalningsåtgärd. Initial läsning skjuts upp om parent fortfarande är upptagen. Scope/generation/unmount-skydd avvisar sena svar. Dirty beforeunload-varning. Inga tokens eller betalningsunderlag persistenteras lokalt.

Typkontroll PASS efter integration. Parent ansvarar för verkliga roll-/ledger-/samtidighetsprov, browserresa och publicering; denna agent har inte gjort apply/publish.

## Oberoende granskningsrättelser
Misslyckad manuell hämtning fryser skrivning med conflict=true tills en uttrycklig hämtning lyckas. Senast kända belopp märks som potentiellt inaktuella och formulärdrafterna bevaras. Om receipts_truncated får administratören ange ett känt äldre receipt-UUID från avstämningsunderlaget; servern kontrollerar samma order/aktiv registrering och beloppet kan inte överstyras. Listval och manuellt ID är ömsesidigt exklusiva. Registrerings-ID visas i historikraderna. Betalningsformulären har en scoped enkolumnsgrid även på desktop så att nästlade orderdetaljer förblir läsbara.
