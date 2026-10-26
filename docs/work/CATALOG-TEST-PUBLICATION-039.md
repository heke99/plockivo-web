# CATALOG-TEST-PUBLICATION-039 — Explicit publicering till testkatalog

2026-10-26. Komponenten CatalogTestPublication tar sparad StandaloneCatalogItem, tenantId, disabled och valfri onBusyChange. Parent måste ge den faktiskt sparade källversionen och kan låsa redigering under körning. Endast aktiv artikel som är förberedd för självskanning kan startas.

Kundlistan hämtas först vid explicit Förbered testartikel. Bara aktiva, ospärrade konton för samma tenant visas. Listans begränsning högst 200 kommuniceras. Inget konto, mandat eller kredit skapas.

POST befintlig endpoint standalone-catalog/:id/test-publication med tenant_id/version/customer_account_id. Bekräftelse före första begäran, fast UUID-nyckel per payload och låst kundval efter första försök. Okänt resultat behåller body/key och visar samma-uppgifter-retry. Nästa käll-ID/version/tenant återställer lokalt UI; ingen localStorage eller annan persistens. In-flight svar ignoreras om källan ändras eller komponenten unmountas. onBusyChange skyddar parent-shell under GET och POST.

Svar valideras mot mode=test och samma källa/version/kund innan framgång visas med produkt-ID. Testartikel är en ny kopia, inte automatisk uppdatering. Ingen verklig kredit/lager/faktura/utlämning öppnas.

Ingen build/publicering av denna agent. Parent verifierar UI tillsammans med nya API-/SQL-regler och bekräftar att servern också kontrollerar kundbehörighet/status (UI-filter är inte åtkomstskydd).
