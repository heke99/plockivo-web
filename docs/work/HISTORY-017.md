# HISTORY-017 — bounded order history operations

2026-10-26. Customer history retains the existing server authorization and latest-50 bound. UI explicitly says search covers only those 50 permitted intents, not all historical orders. No cursor API or unlimited fetch introduced.

Implemented: underlag-ID search max100 characters, exact status filter, pages of10, page clamping on filter changes, result count and empty/loading states, update action clears stale history before fetch, active-membership switch clears loaded history and remounts filters. Opening an intent still reads current authorized server state. No sensitive history or filter is persisted to localStorage or URL. Reload returns to current default workspace; persistent selected order is not implemented.

Pure helper tests prove tenant filtering, bounded page output, clamping, exact status/search combination and empty results. Focused browser test uses intercepted API and is UI-only; existing SQL/RLS owns data authorization.

Also integrated scoped merchant-job inspection component from NOTIFICATION-016 into merchant settings. Parent owns consolidated release evidence. No production sales or domain activation.

Final integrated web verify PASS: standard/typecheck, 26 tests and production build (/tmp/plockivo17-web-final.log). Chromium on fresh port3527 PASS: 25 rows paginated10, next page, ID filter, status intersection empty state, membership switch clears prior-tenant rows and filters, 390/768/1440 no overflow, no pageerrors. Initial test rendered stale local test-server output; fresh port and final integrated build resolved it. No Auth mutation or persistent test fixtures used.
