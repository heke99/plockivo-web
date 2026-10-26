# CATALOG-BATCH-033 — Sekventiell CSV-import

2026-10-26. `CatalogImport` tar `tenantId`, `disabled`, `onSelect`, `onChanged` och `onBusyChange`. Parent låser artikelredigeraren under aktiv körning. Listan uppdateras en gång när körningen slutar/pausas efter minst en bekräftad rad.

Parsergräns 2000 artiklar och 2 MiB. Endast första 100 rader visas i förhandsgranskningen; alla validerade rader ingår vid explicit Spara alla. En enda felaktig rad blockerar hela batchstarten. Rader skapar nya artiklar med id=null/version=0 via befintliga standalone-catalog endpointen; inget nytt batch-API, inga automatiska uppdateringar.

Runner gör ett anrop i taget med en fast UUID-idempotensnyckel per rad. Nästa rad skickas först efter validerat svar för föregående. Första felet/okänt utfall stannar körningen och behåller aktuell body/key. Fortsätt återanvänder samma nyckel och hoppar över endast bekräftade rader. Paus/unmount/tenantbyte stoppar före nästa request och avbryter inte en redan pågående mutation. Pending keys ligger endast i minnet, aldrig localStorage eller cookies. Omladdning förlorar dem; innan omladdning varnas användaren via beforeunload och tydlig UI-text.

Resultat-JSON innehåller rad, SKU, tenant, status, fel och idempotensnyckel, inga token. Blob-URL för nedladdning återkallas vid nästa nedladdning och unmount. CSV-exempel/tom mall länkas till föräldrarnas statiska templates.

Riktade node-tester: 7 PASS (batch commit-then-timeout/retry samma key, ingen nästa rad före svar, paus, samtidighetslås, ogiltig rad blockerar, CSV-pris/quotes/duplicering, 2000-gräns och >2MiB). Bygge och browser/tenant/presentation kontrolleras av parent. Ingen publicering av denna agent.

Avsluta importen: pausad/stoppad batch kan explicit avslutas efter bekräftelse som förklarar att bekräftade och möjligen sparade rader ligger kvar, keys försvinner och resultat bör hämtas först. Det gör inga servermutationer och tillåter en korrigerad fil utan omladdning.
