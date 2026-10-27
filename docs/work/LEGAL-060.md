# LEGAL-060 — Ägare, integritet, användarvillkor och cookies

Datum/version: 2026-10-27. Ägare: Trafexa Nordic AB. Målgrupp: svenska företagsanvändare och webbplatsbesökare. Språk: svenska. Produkt: Plockivo.

## Levererat

Offentliga, versionsmärkta /integritetspolicy, /allmanna-villkor, /cookies och /om-plockivo. Gemensam serverrenderad sidfot på samtliga sidor, även inloggningen; registrering visar länkar före kontoskapande. Ägare och plattformsleverantör hålls åtskild från säljande handlare och ansvarig kundorganisation. Ingen påhittad prislista, abonnemangstid, automatisk avtalsaccept, cookieaccept eller generell ansvarsfriskrivning. Ingen databas-/behörighetsändring.

Identitet: användarens uttryckliga ägaruppgift, företagsnamn/org.nr/postadress samstämmiga i Allabolag och Bolagsfakta (kontrollerat 2026-10-27). Kontakt är användarens tidigare angivna företagsadress. Inga nya mailkonton eller utskick skapade.

## Inventering och rättsligt underlag

- web/src/lib/supabase.ts: host-only HttpOnly, Secure i produktion, SameSite=Lax. @supabase/ssr0.8.0 DEFAULT_COOKIE_OPTIONS maxAge400dagar. Supabase JS2.118.0 härleder sb-[projectref]-auth-token. Delkakor och PKCE-code-verifier omfattas; sessionens faktiska giltighet är separat.
- Ingen analys-/annonsintegration eller localStorage/sessionStorage i appkoden. public/sw.js cachar inte privata svar. Inget val lagras för en banner som inte behövs.
- Konton, sessioner och MFA: Supabase. Webb/API: Vercel. Konfigurerad kontoleverans: Strato. Ingen Resend-leverans påstås. Inga nya mottagare införda.
- Verksamhetsdata: tenant-/rollstyrda medlemskap, projekt, varukorg, order, attest, utlämning och manuell avstämning. Kameran används lokalt efter uttrycklig begäran; ingen videouppladdning.
- Nödvändiga cookies behöver inte samtyckesbanner: https://pts.se/internet-och-telefoni/kakor-cookies/
- Informationskategorier och rättigheter: https://www.imy.se/privatperson/dataskydd/dina-rattigheter/ratt-till-information/
- Företagsuppgift: https://www.bolagsfakta.se/5568554884-Trafexa_Nordic_AB

## Kontroller

Lokalt: standard0fel, TypeScript PASS, alla59befintliga webbtester PASS, Next16.4.2 webpack produktionsbygge PASS med alla fyra nya statiska routes. Separat HTTP-test av byggd server: /, /app, /register och fyra informationssidor HTTP200; alla innehåller rätt ägare/org.nr, fyra fungerande informationslänkar, exakt en footer och ingen anonym Set-Cookie. Reactgenomgång: gemensamma statiska serverkomponenter, inga nya klientbibliotek/effekter, semantiska rubriker/nav/landmarks, tangentbordsåtkomlig tabellscroll, responsivt avgränsad CSS.

## Avgränsning och driftansvar

Detta är publicerad produktinformation, inte intyg om full GDPR-efterlevnad eller juridisk expertgranskning. Inga nya acceptbevis skapas och inga tidigare användare tillskrivs accept. Butikens separata försäljningsvillkor ändras inte.

Trafexa Nordic behöver förvalta faktiska biträdesavtal, aktuella underbiträden/regioner/överföringsstöd, logg-/backuplagring och kategorispecifik gallring. Dessa avtal/inställningar har inte verifierats i denna ändring; texten lovar därför varken EU-exklusiv behandling eller en påhittad automatisk raderingsfrist. Kontoavslut/rättighetsärenden sker via publicerad kontakt, ingen självbetjäningsradering utlovas. Ingen generell produktions-GREEN; tidigare faktisk Strato-/fysisktelefonresa återstår.

Publicering och browserkontroll dokumenteras efter att det testade kodläget driftsatts.
