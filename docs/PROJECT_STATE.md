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
