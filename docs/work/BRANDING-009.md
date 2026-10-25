# BRANDING-009 — handlarprofil i kundvyn

2026-10-25. Kundvyn visar profil för det aktiva medlemskapet från autentiserad context: visningsnamn, kompakt rasterlogotyp och dekorativ färgremsa. Plockivos avsändaridentitet finns kvar. Ingen profil hämtas från hostname, URL-parametrar eller browser storage. Profilen härleds direkt vid render, så byte av medlemskap eller utloggning kan inte lämna en separat gammal profilstate.

Klientens displayBranding validerar profilvärden defensivt: endast sexsiffrig hex-färg och begränsad PNG/JPEG/WebP data-URL. SVG, externa logotypadresser och andra URL-scheman nekas. Namn renderas som text, inte HTML. Färgen används inte bakom text; etablerad textkontrast bevaras. Bildfel döljer bilden och lämnar handlarens namn läsbart. Saknad profil använder medlemskapets merchant-namn, standardgrön färg och ingen logotyp.

## Verifierat

- npm run verify PASS: standardkontroll, typkontroll, sex enhetstester och produktionsbygge.
- tests/branding.test.mjs: nekade logo-/färgvärden och ren fallback PASS.
- tests/e2e/buyer-branding.cjs: riktig Chromium mot slutbygget, med avsiktligt intercepted context och MFA/session-svar. Aktiv handlarprofil, färg och logotyp, byte A→B med full borttagning av A:s logotyp/namn, fallback, byte tillbaka och utloggning PASS.
- 390/768/1440px utan horisontell scroll, inga pageerrors. Mobilskärmbild visuellt granskad.

Browserprovet är ett avgränsat UI-test och bevisar inte Auth/RLS eller verklig driftintegration. Backendens SQL-rolltest verifierar dataåtkomsten separat. Inga nya konton, testdata eller hemligheter skapades av detta UI-test.

## Kvarstår

Domänaktivering, anonym profil före login, handlarbundet PWA-manifest och kanonisk adress är inte del av denna ändring. Namn/färg/logotyp i befintliga sessioners context förnyas vid omladdning/inloggning; ingen realtidsdistribution av profiländringar påstås.

Parent slutkontroll: riktig authenticated SQL-matris PASS (scope, revocation, fallback, whitelist). Servermigration 20261025224041 synkad. Guardad gammal profilfixture-städning lyckades; readback följs i projektstatus. UI-test med intercepted context är endast visningsbevis, SQL utgör separat behörighetsbevis. Ingen domänaktivering.
