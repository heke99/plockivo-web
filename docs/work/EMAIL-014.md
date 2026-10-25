# EMAIL-014 — faktisk e-postleverans

2026-10-26. Målet är aktiverad Auth-leverans, inte bara ändrade featureflaggor.

## Observerat läge

- Resend list_domains: trafexa.com, div3rsa.com och gridex.se är verifierade med sending enabled. Ingen plockivo.com-avsändardomän finns.
- Försök att skapa plockivo.com i eu-west-1 med spårning avstängd avvisades: HTTP 403, domängränsen i abonnemanget är nådd. Ingen domän skapades och inga DNS-poster returnerades.
- Vercel get_domain för plockivo.com i befintliga Div3rsa-teamet gav 404. Detta visar endast att den inte hanteras där; inget påstående om extern registrering eller ägande.
- Vercel plockivo-web env-metadata innehåller Supabase URL/publishable key, app/API-origin och API-bypass. Inga e-postflaggor finns. Inga hemliga värden lästes.
- Supabase-anslutningen saknar operation för att läsa eller ändra Auth SMTP-/bekräftelseinställningarna. Inga värden har antagits verifierade.

## Resultat och nästa exakta handling

BLOCKED för faktisk leverans. AUTH_EMAIL_DELIVERY_ENABLED och AUTH_EMAIL_CONFIRMATIONS_VERIFIED har inte slagits på. Inga riktiga mejl skickades och ingen leverans påstås.

Det behövs en ledig Resend-domänplats (utan att ändra andra projekts avsändare), följt av verifierad Plockivo-avsändardomän och DNS-åtkomst. Alternativt måste produktägaren uttryckligen välja en befintlig verifierad avsändardomän för Plockivo. Därefter konfigureras Supabase SMTP med säker credential-entry, Email Confirmations kontrolleras, fasta callbackadresser allowlistas och ett kontrollerat leveransprov följs från Auth till leverantörens leveransstatus. Först därefter öppnas flaggorna och ny deployment verifieras.

## Förberedelse

src/lib/email-readiness.ts uttrycker de fyra operativa bevis som krävs: verifierad avsändare, Auth-transport, bekräftelsepolicy och leveransprov. Det är en separat kontrollfunktion, inte kopplad till runtime-flaggorna och inte ett behörighetsbeslut. Tester visar att varje saknat bevis håller kontrollen stängd. Enhetstest är inte leveransbevis.

Konfigurationsnamn att fastställa: AUTH_EMAIL_FROM, AUTH_EMAIL_SENDER_DOMAIN, AUTH_EMAIL_DELIVERY_ENABLED, AUTH_EMAIL_CONFIRMATIONS_VERIFIED. Supabase SMTP: host, port, user, password, sender email/name och tillåten callback-origin ska läggas in direkt i Auth-konfigurationen; SMTP-lösenord får inte läggas i repo eller frontend. Inga påhittade standardvärden har använts.

Implementerat även schema som nekar fel avsändardomän och testbara svenska aktiverings-/återställningsmallar med text+HTML, fast HTTPS-origin och escaped länk. Mallarna är förberedda adaptrar, inte installerade i Supabase. Tre tester PASS.
