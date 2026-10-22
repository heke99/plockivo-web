# Webbcheckpoint — 2026-10-22

Plockivo-web 0.2.0 är fristående. Inloggning, sessionsproxy, katalog, kamera där BarcodeDetector stöds, manuell reservväg, serverlagrad ägd varukorg, versionskonflikter, återupptagning, låst prisunderlag, attestgränssnitt och testorder finns. Vid ändring krävs nytt underlag; gamla underlag spärras i samma databastransaktion. Accepterad order får ny korgidentitet för nästa köp. API-kontrakt 0.2.0 och SHA är låsta i contracts.lock.json.

4 tester, typkontroll och build passerar. Browser verifierar sparad korg efter reload, testorder, ny tom korg, utloggning och mobilvy. Slutlig omkörning av mandat-/logoutjusteringen PASS. Testdata städade. Affärsregler och SQL-tester ägs av separat API-projekt.

API-grunden publicerad i heke99/plockivo efter uttryckligt godkännande. Produktägaren har skapat heke99/plockivo-web. Webb 0.2.0 är publicerad där separat från API:t. GitHub CI 39857451898 PASS. Skyddad testdrift finns på https://plockivo-web.vercel.app, API på https://plockivo-api.vercel.app. Driftsatt HTTP-/browserresa, mobil, Secure HttpOnly host-only cookies och logout/401 PASS. Syntetiska testdata städade. Nästa steg är API-worker-nyckel och Workflow-verifiering samt inbjudan/MFA och verklig integrationsprofil. Inte redo för verklig pilot.
