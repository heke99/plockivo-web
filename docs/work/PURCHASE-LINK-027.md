# PURCHASE-LINK-027 — Köp som kan öppnas på flera enheter

## Kontrakt
`purchaseLink(id)` skapar en lokal `/app?purchase=<uuid>` och kastar vid ogiltigt ID. `parsePurchaseLink(location.search)` returnerar ett normaliserat ID eller null. Dubbla parametrar, fullständiga URL:er och felaktiga värden ignoreras. Länken innehåller ingen behörighet, e-postadress eller token.

## Integration
Arbetsytan ska behålla query-parametern över inloggning/MFA och därefter läsa underlaget genom befintligt autentiserat API. Kontrollera handlarens tenant före visning. Byt inte mandat automatiskt och utlös aldrig köpbekräftelse, attest eller annan mutation genom att öppna länken. Efter nekad åtkomst visas ett begripligt fel; gamla underlag får inte lämnas synliga.

## Verifiering
Avgränsat Node-test verifierar lokal destination, normalisering, tvetydighet, ogiltiga värden och att övriga auth-parametrar inte blir köp-ID:n. Integration och browser testas av huvudagenten. Ingen e-post, inget testkonto och ingen köpoperation skapad.
