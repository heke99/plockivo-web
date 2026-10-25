# RECOVERY-011 — återställning och autentiseringsretur

2026-10-25. Återställning via mejl kräver AUTH_EMAIL_DELIVERY_ENABLED=true; default false. Avstängt flöde ger tydlig 503 och anropar ingen mejlleverantör. Konfigurerad begäran använder endast APP_ORIGIN och /auth/callback?mode=recovery. Kända kontospecifika leverantörsfel, inklusive begränsade försök, får samma generiska svar som normal begäran. Leverantörs-/nätverksoutage ger 503 utan privata detaljer. Supabase Auth äger utskickens rate limits; ingen egen distribuerad IP-limiter införs här.

Callback skiljer mode=activation från mode=recovery, tillåter äldre återställningslänk utan mode, ignorerar godtyckliga returadresser och bygger bara mål från konfigurerad origin. Saknat/ogiltigt/använt PKCE-bevis och utgången länk leder till generiskt auth_error. Redirect är 303, no-store/no-cache/no-referrer. Inget bevis loggas eller kopieras till mål-URL.

Lösenordsändring kontrollerar verifierad användare och auktoritativ get_security_state före updateUser. Återställning eller queryparametern recovery ger ingen väg runt MFA. Global utloggning sker efter lyckad ändring; ofullständig utloggning rapporteras som delvis utfall, inte full framgång. Vanlig utloggning rapporterar leverantörsfel istället för falsk framgång. Förlorad MFA hanteras inte automatiskt.

Workspace visar korrekt aktiveringsmeddelande, personlig aktiveringslänk från inbjudan och begripligt fel vid ogiltig länk. Återställningsformulär använder new-password och visar inte onödigt e-postfält.

Verifiering: sju dependency-injected recovery-tester PASS för fasta mål, aktivering/återställningsseparation, avstängd leverans, generiska kontosvar, outage, MFA-/identitetsbarriär samt ordnad lösenordsändring/utloggning. Typecheck PASS vid första integration. Slutlig sammanförd verify och runtime-prober följer separat. Inga mejl till riktiga mottagare har skickats. Faktisk leverans och engångsanvändning hos Auth kräver verifierad avsändare/testinkorg och räknas inte som genomförd här.

## Sammanförd slutkontroll

Slutlig npm run verify PASS: dokumentkontroll, typkontroll, 21 webbtester och produktionsbygge. Sju av testerna gäller recovery. Efter lyckad lösenordsändring körs nu revoke_my_sessions före Auth-globalutloggning; aktuell gammal session spärras auktoritativt för verksamhetsåtkomst. Misslyckad spärr efter sparat lösenord är explicit delvis utfall (503) med instruktion att återkalla under Kontosäkerhet, aldrig falsk helframgång. Test verifierar ordning och felutfall.

Byggd HTTP-probe på lokal port 3410 PASS: avstängd reset 503/no-store utan skickat mejl; främmande Origin 403; callback utan kod, med otillåtet mode eller error returnerar 303 endast till konfigurerad origin med auth_error. Cache-Control no-store och Referrer-Policy no-referrer verifierade. Första proben fann att globala Next-headern skrev över callback-headern; global Referrer-Policy ändrades till no-referrer och slutbyggets probe passerade. Anonyma revoke-all-anrop gav 401, främmande Origin 403 och saknad uttrycklig bekräftelse 400.

Första dependency-injection-typkontrollen hittade Promise vs PostgREST PromiseLike-skillnad; signaturen korrigerades utan typcast. Slutliga tester PASS. Inga riktiga utskick, lösenordsändringar eller konton användes i dessa prober. Verklig mejlbekräftelse och resetlänkens engångsanvändning är fortsatt blockerade av ej aktiverad leveransprofil och får inte räknas som E2E PASS.
