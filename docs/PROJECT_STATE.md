# Webbcheckpoint — 2026-10-23

Plockivo-web 0.2.0 är fristående. Inloggning, sessionsproxy, katalog, kamera där BarcodeDetector stöds, manuell reservväg, serverlagrad ägd varukorg, versionskonflikter, återupptagning, låst prisunderlag, attestgränssnitt och testorder finns. Vid ändring krävs nytt underlag; gamla underlag spärras i samma databastransaktion. Accepterad order får ny korgidentitet för nästa köp. API-kontrakt 0.2.0 och SHA är låsta i contracts.lock.json.

4 tester, typkontroll och build passerar. Browser verifierar sparad korg efter reload, testorder, ny tom korg, utloggning och mobilvy. Slutlig omkörning av mandat-/logoutjusteringen PASS. Testdata städade. Affärsregler och SQL-tester ägs av separat API-projekt.

API-grunden publicerad i heke99/plockivo efter uttryckligt godkännande. Produktägaren har skapat heke99/plockivo-web. Webb 0.2.0 är publicerad där separat från API:t. GitHub CI 39857451898 PASS. Skyddad testdrift finns på https://plockivo-web.vercel.app, API på https://plockivo-api.vercel.app. Driftsatt HTTP-/browserresa, mobil, Secure HttpOnly host-only cookies och logout/401 PASS. Syntetiska testdata städade. WORKER-004 är verifierad med aktiv cron. MFA-005 implementerar TOTP-aktivering, challenge vid inloggning och faktorbyte med befintligt bevis; verifierat i lokal browser/HTTP och driftsatt aktivering/login/mobil/logout enligt [MFA-005](work/MFA-005.md). Kod-CI 39955297867 PASS, webb 9e1a63f. Testdata inklusive faktorer/sessioner städade. Nästa steg är personinbjudan/provisionering och verklig integrationsprofil. Inte redo för verklig pilot.


## INVITES-006 — aktivt arbete

Säkra personinbjudningar och UI/framsida implementerade. SQL-rollmatris och lokala kvalitetskontroller PASS. Slutlig browser, publicering och städning följs i [INVITES-006](work/INVITES-006.md). Kontoaktivering och riktiga utskick återstår.
