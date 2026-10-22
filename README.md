# Plockivo webb

Fristående Next.js-app med PWA-grund, personlig inloggning, tunn sessionsproxy och testresa från artikel till accepterad testorder. Läs [projektkontext](docs/PROJECT_CONTEXT.md), [status](docs/PROJECT_STATE.md) och [verifiering](docs/VERIFICATION.md).

```sh
npm ci
cp .env.example .env.local
# Ange Supabases publishable key, APP_ORIGIN och API_URL.
npm run dev
npm run verify
```

Appen behöver ett körande Plockivo API för verksamhetsflöden, men ingen lokal API-checkout för installation, bygge eller komponent-/kontrakttest. API-kontrakt 0.2.0 och dess SHA-256 finns i contracts.lock.json. Genererade typer följer med.

E2E kräver en isolerad testidentitet med testfixturernas inköpsmandat samt `E2E_WEB_URL`, `E2E_EMAIL`, `E2E_PASSWORD`. Installera Playwright i testmiljön och kör `node tests/e2e/purchase.cjs`. Lägg aldrig riktiga kunduppgifter i testfiler. Screenshots är intern testdata och ska inte publiceras.

Källkoden publiceras i heke99/plockivo-web. Webb och API har separata repon. Skyddad testdrift: https://plockivo-web.vercel.app. Vercel-inloggning och personligt Plockivo-konto är separata kontroller; ingen verklig pilot är aktiverad.
