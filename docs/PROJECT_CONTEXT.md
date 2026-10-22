# Plockivo webb — projektkontext

Fristående Next.js PWA och tunn serverproxy. API/databas och affärsregler ägs av heke99/plockivo. Masterplan v2.2 och Engineering Startkit 3.0.0. Kontraktets exakta version och SHA-256 finns i contracts.lock.json; genererad TypeScript finns i src/generated/api.ts. Ingen lokal API-checkout behövs för installation eller bygge.

Kommandon: npm ci, npm run typecheck, npm test, npm run build, npm run standard, npm run verify. Webb 3000, API 3001. .env.example visar namnen; inga workerhemligheter får läggas här.

Läs [projektstatus](PROJECT_STATE.md), [klientbeslut](DECISIONS.md) och [verifiering](VERIFICATION.md) före återupptagning. SQL och permissions redigeras endast i API-projektet.

Säkerhet: host-only HttpOnly-sessioner i BFF, exakt Origin på POST, API verifierar användaren med getUser innan verksamhetsanrop, ingen affärslogik i proxy, inga privata API-cachar.

Webbens separata GitHub-repo är heke99/plockivo-web, skapat av produktägaren. Offentlig publicering är uttryckligen godkänd. API ligger kvar i heke99/plockivo.
