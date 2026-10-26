# STANDALONE-UI-024-025 — fristående administrativa register

2026-10-26. Plockivo ska stödja två driftalternativ: fristående handlarregister och anslutning till handlarens befintliga affärssystem. Valet avgör auktoritet för sortiment, priser, kredit, lager och fakturering; samma uppgift ska inte få två samtidiga skrivande auktoriteter. Detta är administrativ förberedelse, inte öppnad produktionsdrift.

## Levererat gränssnitt

Butiksinställningar visar katalogen för `catalog.manage.standalone` och kundregistret för `customers.manage`. API/databas verkställer behörigheten; klientpermission styr bara navigation. Komponenterna är nycklade per handlare och städar sena svar efter avmontering.

Katalogen kan skapa och redigera artikelnummer, namn, enhet, mängdsteg, förpackning, streckkod, grundpris, moms samt aktiv-/självskanningsmarkering. SEK-pris konverteras med strängar/BigInt till heltalsören utan flyttalsavrundning. Vid versionskonflikt bevaras användarens utkast och sparknappen spärras tills aktuell artikel valts igen. Upprepning med samma utkast återanvänder idempotensnyckeln. Listan hämtas uttryckligen på nytt och visar API:ts begränsade resultat.

Kundregistrering skickar endast handlar-ID, företagsnamn och organisationsnummer. Nya konton visas som spärrade/ej verifierade med kreditram noll. Ingen användare, inbjudan, kredit eller inköpsrätt skapas i gränssnittet.

## Avgränsning

Katalogen är separat från befintlig syntetisk testprisadapter och öppnar inte verkliga köp. Kundregister är inte juridisk verifiering. Kontroll av organisationsnummer är inte ett Bolagsverketbesked. Prisauktoritet, avtalsvillkor, kreditbeslut, import/export, lager och fakturering måste färdigställas och verifieras före fristående kunddrift. ERP-kopplingar kan läggas till utan att kunden måste byta system.

## Verifiering

Två exakta penningkonverteringstester samt befintliga webbtester och typkontroll PASS före slutlig API-generering. Slutbygge och fokuserat Chromium-prov dokumenteras efter körning. Browserprovet använder kontrollerade API-svar och är enbart gränssnittsbevis; det ersätter inte API-agenternas SQL-rolltester. Inga bestående testkonton eller verkliga kunddata skapas av UI-provet.

Slutlig webb verify PASS: dokumentkontroll, typkontroll,30 tester och produktionsbygge efter API-kontraktssynkning. Chromium UI-only PASS: exakt priscreate/readback, konflikt med bevarat utkast, kundcreate skickar inga kredit-/mandatfält, spärrat kundkonto med noll kredit, gated503 rensar gammal lista,390/768/1440 utan overflow och inga pageerrors. Desktopbild visuellt granskad. Ingen livekatalogaktivering eller verkligt köp påstås.
