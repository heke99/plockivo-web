# Webbcheckpoint — 2026-10-23

Plockivo-web 0.2.0 är fristående. Inloggning, sessionsproxy, katalog, kamera där BarcodeDetector stöds, manuell reservväg, serverlagrad ägd varukorg, versionskonflikter, återupptagning, låst prisunderlag, attestgränssnitt och testorder finns. Vid ändring krävs nytt underlag; gamla underlag spärras i samma databastransaktion. Accepterad order får ny korgidentitet för nästa köp. API-kontrakt 0.2.0 och SHA är låsta i contracts.lock.json.

4 tester, typkontroll och build passerar. Browser verifierar sparad korg efter reload, testorder, ny tom korg, utloggning och mobilvy. Slutlig omkörning av mandat-/logoutjusteringen PASS. Testdata städade. Affärsregler och SQL-tester ägs av separat API-projekt.

API-grunden publicerad i heke99/plockivo efter uttryckligt godkännande. Produktägaren har skapat heke99/plockivo-web. Webb 0.2.0 är publicerad där separat från API:t. GitHub CI 39857451898 PASS. Skyddad testdrift finns på https://plockivo-web.vercel.app, API på https://plockivo-api.vercel.app. Driftsatt HTTP-/browserresa, mobil, Secure HttpOnly host-only cookies och logout/401 PASS. Syntetiska testdata städade. WORKER-004 är verifierad med aktiv cron. MFA-005 implementerar TOTP-aktivering, challenge vid inloggning och faktorbyte med befintligt bevis; verifierat i lokal browser/HTTP och driftsatt aktivering/login/mobil/logout enligt [MFA-005](work/MFA-005.md). Kod-CI 39955297867 PASS, webb 9e1a63f. Testdata inklusive faktorer/sessioner städade. Nästa steg är personinbjudan/provisionering och verklig integrationsprofil. Inte redo för verklig pilot.


## INVITES-006 — publicerad testleverans

Säkra personinbjudningar och UI/framsida implementerade. SQL-rollmatris och lokala kvalitetskontroller PASS. Browser, mobil/framsida, säker replay och städning PASS; API och webb publicerade och Vercel READY. Actions står i kö vid slutkontroll. Evidens finns i [INVITES-006](work/INVITES-006.md). Kontoaktivering och riktiga utskick återstår.

## PROFILE-007 / DOMAIN-008 — 2026-10-25

Administrativ handlarprofil med revisionskontroll, MFA, idempotens och audit implementerad. Domänönskemål kan registreras/listas/tas bort; ingen kundstyrd verifiering eller aktivering. Riktade SQL-rolltester och 12 API-tester PASS. Båda produktionsbyggena PASS. Browser: MFA, spara namn/färg/logotyp, readback, reload, samtidig ändring med behållen draft, återhämtning, nekad bildtyp och domänregistrering/borttagning PASS. Responsivitet och inga pageerrors PASS. Bred SQL-regression hängde och avbröts utan resultat; får inte räknas som PASS. Offentlig branding, domänaktivering, hostresolver och PWA-bindning återstår. Se API-arbetsdokument PROFILE-007 och DOMAIN-008.

## Fyra delar 010–013 — 2026-10-25

ONBOARDING-010: inbjudningsbunden kontoaktivering implementerad, gated av verifierad leverans och bekräftelsepolicy. Ingen verklig e-postleverans eller signup-email-callback kedja testad. RECOVERY-011: fasta callbacklägen/origin, no-referrer, explicit leveransspärr, MFA-skyddat lösenordsbyte och auktoritativ sessionsspärr. SESSIONS-012: egen global utloggning med beständig SQL-spärr; SQL-rolltest PASS. DOCS-013: läsning av sparad testköpbekräftelse med order/doc RLS; verkligt SQL-worker-readback PASS. UI-prov med intercepted API är separata visningsbevis. Webb verify 21 tester och API verify 12 tester/build PASS. Inga nya persistenta fixtures; SQL-sviter rollback. Domänaktivering, verkliga utskick, MFA-förlust och verklig pilot återstår.

## Delar 014–017 — 2026-10-26

EMAIL-014: avsändarvalidering och mailmallar testade; verklig e-postaktivering BLOCKED. Resend403 domängräns, ingen verifierad plockivo.com och ingen ansluten SMTP-konfiguration. MEMBERS-015: kod och tester för mandatåterkallelse förberedda, hosted migration auto-review avvisad, ingen SQL-rolltest; MERCHANT_MEMBER_ADMIN_ENABLED=false. OPERATIONS-016: read-only MFA/tenant-jobböversikt, riktig SQL och UI PASS. HISTORY-017: tydligt begränsad senaste50 lista, sökning/status/pagination inom hämtad mängd. API verify PASS; sammanförd webbkontroll i arbetsdokumenten. Ingen domänaktivering eller verkliga köp.

## Godkänt MEMBERS-015 och READINESS-018 — 2026-10-26

Exakt mandatmigration godkänd av användaren, tillämpad som20261025231731_member_administration och rolltestad PASS (scope/self/admin/version/replay/audit/omedelbar åtkomstförlust). Vercel API production MERCHANT_MEMBER_ADMIN_ENABLED=true inför nästa deployment. READINESS-018 informativ versionsstyrd integrationsinventering implementerad, länk från hjälp. API verify/build PASS, webb verify26 tester/build och browser mobil/dator PASS. Inga verkliga integrationsförmågor aktiveras av inventeringen. E-post kräver fortfarande verifierad avsändare/SMTP.

## Fyra teststeg 019–022 — 2026-10-26

Varukontroll och beständigt claim/confirm samt returmottagning implementerade med SQL-mode=test spärr, aktuellt MFA och separata permissions. Core04427/returns04455 tillämpade, riktiga SQL-rolltester PASS med rollback. Annullering förberedd i pending04633, hosted apply auto-review avvisad; ingen SQL-PASS, TEST_CANCELLATION_ENABLED=false. TEST_FULFILLMENT_ENABLED=true konfigurerad för nästa API deployment endast för syntetiska testorder. Inga fysiska eller ekonomiska effekter öppnade. API verify20 tester/build PASS, webb verify28/build PASS. UI-only Chromium fyra flöden+gated503/mobil PASS, separat SQL auth-bevis. Ingen verklig samtidig sessionskörning; måste verifieras före pilot. Ingen automatisk frigöring av oklara claims, ingen retur→kredit.

## Fristående och ansluten drift — 2026-10-26

D012 och masterplanstillägg godkända: inget generellt ERP-krav. Standalone artikel/pris-preparationsregister024 implementerat men hosted migration auto-review avvisad, SQL ej verifierad, gatefalse. Kundadministration025 migration20261026010357 tillämpad och riktig SQL-rollmatris PASS; gate STANDALONE_CUSTOMERS_ENABLED=true konfigurerad nästa deploy. Nya konton suspended/purchaseblocked/zero credit, inga mandat. API verify25 tester/build PASS. Ingen produktionsförsäljning öppnad eller kredit beviljad. Register innebär inte färdig fristående checkout.

## 2026-10-26 — Publik produkttext
Startsidan beskriver Plockivo utan under-utveckling/pilotbudskap. CTA, FAQ och handlarprofiltext avser befintliga funktioner; ingen automatisk kunddomän utlovas. PWA heter Plockivo och generell topbar visar produktnamnet. Syntetiska order/utlämningsvarningar och funktionsspärrar behålls: textändringen öppnar inte verklig försäljning eller fakturering. Typecheck och produktionsbygge verifieras före publicering.

## 2026-10-26 — Förbered personligt test utan kontoskapande
Egen /forgot-password med e-postvalidering, timeout, generiskt kontoneutralt svar och återlänk. Inloggningen länkar dit utan krav på ifylld adress. Tydlig tomvy för inloggat konto utan mandat, med omläsning och kontosäkerhet; ingen automatisk behörighet. AUTH_EMAIL_DELIVERY_ENABLED=true i Vercel web production för utskicksförsök via användarens sparade Strato-SMTP. SMTP-leverans ännu inte bevisad, AUTH_EMAIL_CONFIRMATIONS_VERIFIED ej öppnad. Inga konton eller utskick skapade i detta steg. Tidigare Resend-domängräns är inte ett krav för Strato. Verklig fysisk utlämning/fakturering fortsatt stängd.

## 2026-10-26 — Fyra parallella delar 026–029
026: explicit TokenHash-bekräftelse på /auth/confirm med fragment och verifiering via POST skapar session på mottagande enhet utan PKCE-verifierare från ursprungsenheten. GET konsumerar inget. Kräver ändrade Supabase-mallänkar enligt EMAIL-LINKS-026; gamla mejl blir inte automatiskt kompatibla. Ingen faktisk SMTP/två-enhetskedja provad ännu.
027: /app?purchase=UUID bevaras vid login/MFA; explicit öppning kräver befintlig API-åtkomst och valt rätt tenantmandat. Ingen automatisk mutation eller mandatväxling. Länk till ny flik i underlaget.
028: endast färdig köpbekräftelse kan skrivas ut; isolerad utskriftsvy och testbegränsningar kvar.
029: /device-check testar API-stöd och uttrycklig kameratillgång utan att behålla videoström. Manuell inmatning kvar när BarcodeDetector saknas. Hjälp länkar dit. Inga testkonton skapade.

## 2026-10-26 — CATALOG-IMPORT-030
CSV-validering/förhandsgranskning och manuell överföring till befintligt artikelformulär, inga automatiska writes. Exakta belopp, CSV-citat, dubbleringskontroll, positiva mängder, 200 poster/256 kB. Sök/filter i hämtade kund-/artikelregister med synlig 200-postbegränsning. Ingen ny checkout-/kreditauktoritet. Användaren har uppgett att nya Supabase TokenHash-mallar sparats; faktisk leverans/två-enhetsprov fortsatt ej verifierade. Inget testkonto skapat.

## 2026-10-26 — Batchimport och mallfiler 032–034
CSV upp till2000 rader/2MiB, nedladdningsbar tom/exempelmall, första100 preview och separat felista. Explicit batchsave en artikel i taget via befintligt API, stabil radnyckel, paus efter pågående svar, stoppa första fel/okänt och säkert återförsök i samma flik. Resultat-JSON, explicit avsluta utan att radera artiklar. UI/formulär/navigering spärras under körning. /import-guide för filer/API. API batchkontrakt synkat; UI använder singeloperationer. Ingen ny användare. Hosted SQL-rollprov PASS/rollback; autentiserad browser-E2E väntar på konto.

## 2026-10-26 — Katalog035–038
Serverbaserad sökning över hela handlarens katalog och keyset50/sida ersätter lokala första200. Föregående/nästa, total, sena svar skyddade och draft bevarad. Aktuell sida kan exporteras CSV med exakta belopp/formelskydd. Journalv1 kan laddas och återuppta efter reload/devicebyte med originalbody/key; samma personliga konto/handlare krävs. Striktvaliderad, ingen auto-write och lokal confirmedstatus är ej serverbevis. Webb52 tester/build PASS. Inget testkonto eller verklig försäljning skapat.

## 2026-10-26 — Testartikel039
Välj Redigera på sparad katalogartikel för separat create-only testpublicering. Endast sparad snapshot, explicit aktivt kundval och bekräftelse, samma body/key på retry, inget automatiskt source/prissync. UI låser andra katalogåtgärder/navigering under GET/POST. Servermode/test är auktoritativt; verklig kredit/fakturering/lager öppnas inte. Hosted SQL-kedja till bekräftad testorder verifierad, inloggad browserresa väntar på testkonto. API-kontrakt synkat.

## 2026-10-26 — Kundpolicy042
Hantera kund öppnar fyra produktionsanvändbara delar: status/köpstopp, manuell kreditram, villkorsversion+granskat underlag, motivering/referens med versionskontroll/replay/audit. Exponering skrivskyddad. Konflikt bevarardraft och kräver explicit readback; kundbyte varnar om osparat. Aktiv kund kräver reviewed+terms, positivkredit reviewed. Vyn gör inget externt kredit-/företagsuppslag och accepterar inte villkor åt kunden. Hostedprodrollprov PASS, browserAuthkedja återstår. Inget permanentkonto skapat.

## 2026-10-26 — Fristående produktion045–053
Produktionsinställningar, kundpriser, lager, butiker/projekt, atomiskt köp, separat attest, helutlämning/helannullering, manuell ekonomiexport, isolerad handlarstart och scopedkundinbjudningar implementerade. Hosted produktionsrollsimulation PASS; 26cleanup0. Handlarstart049 och invitation051 SQL PASS. Direkt-RPC sessionsgräns rättad och hostedregression PASS: levande verifierad Authsession krävs även utan obligatorisk MFA; spärrad/utgången/saknad nekas. 16 nya migrationer synkade till faktisk hostedhistorik. API48/web58 tester PASS och båda byggen PASS (webWebpack; lokalTurbopack cachebug). Full Auth/SMTP/browserkedja och samtidiga separata köpsessioner är ej verifierade; ingen generell GREEN. Se PRODUCTION-E2E-053 i API-repot. Inget permanent testkonto eller verkligt köp skapat.

Slutlig publicering045–053: API8f9dc9f/Vercel dpl_75Ji5WnYMxkKEcFxXKhfY8ZJY2c7 READY; webe5e9a335/Vercel dpl_7t3Cp1CwjeAUDLQq5fsikg8KUfWw READY. Live register/framsida/start-länkar och1363px layout PASS. Sessionsskydd även på direkta MFA-baserade läsningar tillämpat som20261026203132; sessions-/produktionssimulation omkörd PASS. Full autentiserad browser-/SMTPkedja ej körd.

## 2026-10-26 — Betalningsavstämning054–059
Hel-/delbetalning och spårbar återföring för helutlämnade produktionsorder implementerade. Endast full handlaradmin med aktuell MFA. Kreditexponering justeras exakt; projektförbrukning/lager ändras inte. Hostedproduktionssimulation PASS med30cleanup0, inklusive rättelse över sänkt kreditlimit. API50/web59 kodtester och produktionsbyggen PASS. Faktisk Chromium153 UI-simulering med mockad Auth/BFF PASS vid390/768/1440 och misslyckadreadback fryser skrivning. Ny renCI HTTP-testkedja med verkliga lokala Auth/TOTPsessioner och samtidiga betalningsanrop tillagd; CI-resultat dokumenteras efter körning. Ingen banktransaktion, fakturautställning eller faktisk Strato-leverans påstås. Se RECEIVABLES-E2E-059 i API-repot.

Slutcheckpoint054–059: API726a9dd3/Vercel dpl_5e3Gr1bfcKjN9t66qkP6eA1DHnAo READY; web8eca16a5/Vercel dpl_3PBkFvbBAnTdBWeAqpSzBMiFfXFC READY. API Actions40401350268 quality+23SQL+verklig lokal Auth/TOTP/HTTP-kedja med samtidiga betalningar och sessionsstängning PASS; webActions40401356778 PASS. 109kodtester. Live översiktversion3 och /app-inloggningsvy verifierade; inga nya error/fatal-logggrupper i kort startfönster. Hostednamespace540 users/merchants/receipts0. Strato/full autentiserad fysisk-device-kedja fortfarande ej verifierad.

## 2026-10-27 — LEGAL-060
Fyra offentliga informationssidor: integritetspolicy, allmänna villkor, cookies samt ägare/kontakt. Trafexa Nordic AB/org.nr556855-4884 synlig i global sidfot även i appen; länkar före registrering. Verifierad kodinventering: endast nödvändiga Authcookies, ingen frivillig spårning; ingen banner/accept skapad. standard/typecheck/59tester/webpackbygge PASS. Lokal byggd HTTP-svit7sidor PASS:200, ägare, samtliga länkar, enfooter, ingen anonymSet-Cookie. Kommersiella säljarvillkor ändras inte. Se LEGAL-060 för inventering, källor och kvarvarande verksamhetsansvar.
Slutcheckpoint060: web7fa226ec, Actions40494695700 success, Vercel dpl_9dTYXT4jT9VDiBr1gfJKhmUERZrp READY på www.plockivo.com. LiveChrome:fyra informationssidor, ägarfooter även /app, länkar före /register-knapp PASS vid1363px utan sidöverrinning. Inget konto/utskick skapat.

## 2026-10-27 — Kontaktuppgifter061
Användaren har angett info@trafexa.com som gemensam publik kontakt och begärt att gatuadressen tas bort. Central ägaridentitet och gemensam juridisk kontaktkomponent uppdaterade, så ändringen omfattar sidfot och samtliga informationssidor. Ägarens bolagsnamn och organisationsnummer kvarstår.

## 2026-10-27 — LEGAL-062
Förnyad integritetspolicy/cookiesversion2026-10-27.2 med fördjupat innehåll, överblick, stickysektionsmeny, leverantörskort, läsbara cookiekort, rättighetsprocess och FAQ. Kontakt info@trafexa.com, ingen gatuadress. Inga nya spårnings-/samtyckesfunktioner eller paket. standard/typecheck/59tester/slutligtwebpackbygge PASS;7byggda sidors ankare/id/mailto/versioner PASS. Verksamhetsfrågor om faktiska biträdesavtal/gallring/överföringar kvar enligt LEGAL-060. Se LEGAL-062.
