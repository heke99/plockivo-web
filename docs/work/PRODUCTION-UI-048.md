# PRODUCTION-UI-048 — Administration och helorder i produktionsläge

2026-10-26. Nya moduler ProductionAdmin(tenantId,disabled?,onBusyChange?) och ProductionOrder(orderId,onBusyChange?). Parent integrerar endast rätt handlar-/personalmandat och ansvarar för API/SQL-skydd samt sammanförd verifiering.

Admin läser production/setup och högst 200 källartiklar, visar antal/begränsningar och använder serverversioner för varje skrivning. Fem formulär: explicit produktionsaktivering och sales_enabled; kundprispublicering från vald sparad källversion; absolut inventerat saldo med bevarad reservation; butiker med explicit pausval; kundprojekt med exakt budget och oförändrat kundkonto vid redigering. Setup väljer plockivo pris/lager, merchant-manual kredit och manual-export bokföring. Aktiveringscheckbox plus särskild bekräftelse. Ingen automatisk butiköppning. GET:s begränsade listor markeras; osynliga poster antas inte saknas. Butik/projekt måste väljas igen efter extern versionskonflikt och explicit hämtning, formuläret kastas inte tyst.

Ordermodulen tillåter endast mode=production och rätt order-ID från svar. GET visar orderns frysta snapshot/total och exakta mängder. Full utlämning kräver mottagarreferens, explicit fysisk kontroll av samtliga varor och bekräftelse. Helannullering före utlämning kräver motivering/bekräftelse. Inga delutlämningar eller returer utlovas. Anropsnycklar hålls per serialiserad payload, återförsök med samma data återanvänder nyckeln. Konflikter bevarar data och stänger mutationer tills explicit readback. Busy callbacks skyddar parent under hela begäran. Sena svar vid scopebyte/unmount ignoreras.

Bokföringsunderlag hämtas explicit först efter fulfilled. JSON innehåller hela serverunderlaget; CSV innehåller frysta orderrader med exakt net/moms/total och skydd mot kalkylbladsformler. Underlagen är inte fakturor och skickas inte externt. Blob-URL återkallas efter fem sekunder och vid unmount. Inga konton skapas, ingen extern kreditbedömning eller fakturering installeras.

Agenten har inte byggt eller publicerat. Parent måste verifiera API-kontrakt, real-role SQL, slutlig UI och timeout/retry/version/stock/credit/physical fulfillment-resa före skarp användning.

## Integration och inbjudningsupplägg051
Workspace visar ProductionAdmin för merchant_admin, döljer syntetiskt personalflöde vid production-mode och använder intentens frysta mode för köpknapp/ordernotiser. ProductionOrder har separata canManage (confirm), canCancel och canBill, så köparens order är skrivskyddad. OrderConfirmation hämtar produktionens frysta ordersnapshot direkt och kan skriva ut det utan att invänta test-only outbox; inget påhittat skapandedatum visas. Testdokument behåller testvarningarna. Login länkar /register och tomma medlemsvyn /start.

Admin051-formulär skapar endast den aktuella administratörens uttryckliga kundavgränsade inbjudningsmandat. Positiv maxköpgräns, attestgräns högst maxköp, lokal giltighetstid omvandlad till ISO, motivering5..500. Servern prövar >5min och högst366dagar samt administratörens giltighet. Endpoint production/invitation-access. Efter framgång uppmanas användaren uppdatera arbetsytan och välja kundadministratörsmandatet innan personliga inbjudningar skapas.

Typkontroll efter integration PASS (2026-10-26); parent kör slutlig CI/SQL/browser.

## Personalens orderkö052
ProductionOrderQueue och nav för production.fulfillment.read hämtar GET production/orders?tenant_id. Visar senaste högst50, tydlig has_more-text, datum/belopp/status och väljer order-ID direkt till behörighetsstyrd ProductionOrder. Ingen koppling krävs till köparens egen historik. Laddning tömmer tidigare lista, fel hanteras och explicit uppdatering finns. Parent-busy låser navigation under lista/vald order, lokala knappar låses under barnets mutationer. Typkontroll efter köintegration PASS.

## Källartiklar utan 200-gräns i publiceringsvyn
Produktionsadmin hämtar nu källartiklar från standalone-catalog/page med explicit q, limit50 och nyckelmarkörer after_sku/after_id. Sökning i hela registret, nästa/föregående och serverns totala träffantal ersätter den tidigare legacylistan om200 artiklar. Driftöversiktens andra listor är fortfarande explicit begränsade enligt setup-kontraktet.

Vald källartikel hålls som separat sparad snapshot med exakt version. Sökning och sidbyte ändrar inte artikelval, publiceringspayload eller återförsöksnyckel. Om en nyare version hittas erbjuds ett uttryckligt välj-senaste-knapptryck, aldrig automatisk uppdatering av valt underlag. Skilda requestsekvenser och tenant/unmount-skydd avvisar sena söksvar. Alla sök/sidknappar är type=button och orsakar inga publiceringsmutationer. Ingen omotiverad lager-/prisändring sker vid sökning.
