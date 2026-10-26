# CUSTOMER-POLICY-042 — Handlarens manuella kundbeslut

2026-10-26. CustomerPolicy tar tenantId/customerId samt optional disabled/onChanged/onBusyChange. GET/POST merchant-customers/:id/policy. DTO skyddas med kontroll av rätt kund/tenant och decision_authority=merchant-manual. Fyra avsnitt: kundstatus/köpspärr, exakt manuell kreditram/exponering read-only, villkorsversion/manuell granskningsstatus samt motivering/underlagsreferens.

POST version är GET-policy_version, separat från kontots andra data. reason kräver 10–1000 tecken, evidence_reference 1–200. Villkorsversion 1–100 tecken eller null. Kredit konverteras med kronorToMinor utan float. Positiv kredit kräver reviewed. Active kräver reviewed+terms; ingen implicit borttagning av köpspärr. UI förklarar att manuell bedömning inte är extern verifiering, kreditupplysning eller kundens acceptans. Ingen mode-spärr, inget aktivera-alla och inga nya mandat.

Samma serialiserade payload återanvänder UUID-idempotensnyckel efter osäkert svar. Konflikt bevarar hela draften och kräver uttrycklig reload; reload av smutsig draft kräver bekräftelse. Motivering och underlagsreferens töms inte vid ett sparförsök. GET/POST ignorerar sena svar efter kundbyte/unmount med scope+sekvens. Busy callback skyddar parent under läsning och mutation. Dirty beforeunload-varning. Ingen localStorage, token eller persondata i loggar.

Parent integrerar endast för explicit vald kund och kör sammanförd API/SQL/UI-verifiering. Ingen build/publicering av denna agent.
