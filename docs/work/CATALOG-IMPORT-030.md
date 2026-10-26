# CATALOG-IMPORT-030 — Förbered sortiment från CSV

Butiken kan granska upp till 200 artiklar från en semikolonseparerad UTF-8-fil på högst 256 kB. Exakta prisbelopp återanvänder standalone-money. CSV-parsern hanterar BOM, CRLF, citerade fält, dubbla citat och radbrytningar i citat. Alla dubblerade SKU/streckkoder i filen markeras, även första förekomsten. Ogiltiga rader kan inte väljas. Mängder följer SQL-formatet och måste vara positiva; stödda momssatser är 0/6/12/25.

Inläsning och förhandsgranskning är lokala och gör inga verksamhetsanrop. En vald rad fyller befintligt nyartikelformulär; osparad draft kräver bekräftelse. Användaren granskar och sparar en artikel åt gången genom befintlig tenant/MFA/version/idempotens-skyddad operation. Inga uppdateringar matchas automatiskt efter SKU. Serverns unikhetskontroll är slutlig. Ingen batchatomicitet eller automatisk checkout-auktoritet utlovas. Självskanning är avstängd på importerade förslag.

Sökning i artikel- och kundregister gäller hämtade högst 200 poster, med tydlig begränsning. Ingen helregistersökning eller export påstås.

Fokuserad parsermatris verifierar exakta belopp, ledande nollor i streckkod, citat, dubbletter, formatfel och storleks-/antalgränser. Riktig filväljare och sparning med ett användarkonto behöver verifieras när testkontot skapas. Ingen databasförändring, inget nytt konto och inga utskick ingår.
