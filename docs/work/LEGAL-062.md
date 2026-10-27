# LEGAL-062 — Fördjupad integritets- och cookieinformation

2026-10-27. Uppdrag: användaren önskar mindre grundläggande integritets- och cookiesidor. Rätt kontakt info@trafexa.com, ingen gatuadress, behålls från061.

## Ändring

Integritetspolicy och cookies version2026-10-27.2: ny fördjupad layout med mörkgrön dokumentintroduktion, versionsrad, tre sammanfattningskort, innehållsnavigering med fungerande sektionsankare och kontaktväg. Sidomeny sticky vid stor bredd, staplad vid mindre bredd. Serverrenderat, inga nya paket, klientskript, lagringsanrop eller samtyckesval.

Integritet:11ämnesavsnitt samt kontakt. Utökat om obligatoriska kontouppgifter/källor, ansvar mellan Trafexa Nordic och kundorganisation, leverantörernas uppgifter, lagringskriterier per kategori, rättigheter med villkor, säker åtkomst och konkret begäran i tre steg. E-postlänk med ämne öppnar användarens e-postprogram; inget meddelande skickas av webbplatsen.

Cookies:8ämnesavsnitt samt kontakt. Separata läsbara inventeringskort för authsession och PKCE, första part, namn/delkakor/innehåll/aktivering400dagarsmaximum, separat faktisk sessionsgiltighet, hur användning och utloggning påverkar lagring, webbläsarval, serverdata/varukorg/nedladdningar/kamera/serviceworker och fem öppningsbara FAQ. Inga avstängda eller fiktiva reglage för analys/annonser som inte används.

Delad LegalPage har valfria summary/contents/version-props; villkor/ägarsida behåller enklare innehåll. Kontaktägare är central. Inga ändrade verksamhetsregler, dataflöden eller accepterade avtal.

## Underlag och granskning

Aktuell kod och @supabase/ssr0.8.0 cookieoptions granskade. Samma faktaunderlag som LEGAL-060. Officiell vägledning öppnad2026-10-27:
- https://www.imy.se/privatperson/dataskydd/dina-rattigheter/ratt-till-information/
- https://pts.se/internet-och-telefoni/kakor-cookies/

Ingen garanti om juridisk fullständighet. Inga nya faktapåståenden om verifierade biträdesavtal, EU-exklusiv lagring eller automatiska raderingsfrister. Dessa tidigare identifierade verksamhetsfrågor kvarstår.

## Verifierat före publicering

standard PASS0fel, typecheck PASS,59befintliga webbtester PASS, slutligt Next16.4.2 webpackproduktionsbygge PASS. Separat HTML-kontroll av7byggda sidor: unika id:n, alla interna sektionsankare når ett id, alla mailtolänkar info@trafexa.com, ingen tidigare personligadress/gatuadress; båda fördjupade sidor har version2026-10-27.2 och innehållsnavigering. Reactgranskning: statiska serverkomponenter, semantisk struktur, inga nya effekter eller klientberoenden, native details/summary med tangentbordsfokus, CSS begränsad till juridiska informationskomponenter. Produktens befintliga59tester verifierar övriga beteenden, inte juridisk riktighet.

Drift- och browserresultat tillkommer efter publicering. Ingen mobil-/fysisktelefon-PASS påstås av CSS-granskningen ensam.

## Publicerat och livekontrollerat

Runtimecommit a0f999b03ba1b2d7ded610331259f23018745022, Vercel dpl_6653xPN1S8gtsbxmMd21Mj6orgdc READY, alias www.plockivo.com/plockivo.com. Faktisk Chrome1363px: båda sidorna visade nya introduktioner, version.2, tre överblickskort, sektionsmeny och korrekt innehåll. Visuell granskning av båda sidor PASS; sidbredd1348<=viewport1363, ingen horisontell sidöverrinning. Policyns länk till begäran scrollade till rätt avsnitt (top23.7px) med korrekt mailtolänk. Cookies visade två inventeringskort och fem FAQ; frågan om400dagar öppnades med korrekt svar. Ingen gatuadress eller tidigare mejladress i renderad sida. Ingen e-post skickades. Fysisktelefon/mobilviewport inte körda i denna ändring.
GitHub Actions40496500752: completed/success på runtimecommiten ovan.
