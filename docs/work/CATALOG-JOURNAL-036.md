# CATALOG-JOURNAL-036 — Återhämtning efter omladdning

Återställningsjournal v1 innehåller full ursprunglig payload, radnyckel och status. Max2000 poster/4MiB. Export/read av journal gör inga serveranrop och sparar inget automatiskt. JSON-filen granskas strikt: rätt tenant både toppnivå och radbody, id:null/version0, korrekta belopp/mängder/booleans, ingen okänd aktör/behörighet/token, unika radnummer och anropsnycklar med API-format. Hela filen måste valideras före första effekt. Använd samma personliga konto och handlare som vid importstart eftersom SQL-idempotens är aktörsbunden.

Filen ger ingen serverbehörighet eller serverbevis. Markerade confirmed-rader hoppas över som lokal uppgift. Pending/uncertain skickas först efter uttrycklig bekräftelse med oförändrat body/key och normal server/MFA-kontroll. Felaktigt manipulerad journal kan inte ge företagsmandat. Inga automatiska utskick, inga bearer-token, ingen localStorage.

Fyra riktade tester PASS: originalpayload/keys bevaras mellan klienter, confirmed skip, fel tenant avvisas, injicerade id/version/okända fält/status/key avvisas, storleksgräns och legacyrapporter kan inte bli körbara batcher. Tre tidigare batchtester PASS inklusive timeout efter commit och paus innan nästa rad. Verklig browser-filväljare och Auth-session återstår till testkontot.
