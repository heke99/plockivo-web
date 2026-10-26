# EMAIL-LINKS-026 — öppna e-postlänk på annan enhet

## Problem och ändring
Den befintliga `/auth/callback` växlar PKCE-kod mot session och behöver verifieraren från webbläsaren där flödet startade. Ett mejl öppnat på annan enhet saknar verifieraren. Nya `/auth/confirm` tar i stället emot Supabases `TokenHash` i URL-fragmentet och verifierar det på servern med `verifyOtp` efter ett uttryckligt knapptryck. Sessionens HttpOnly-kakor skapas i webbläsaren som öppnar länken. Inga företagsmandat skapas.

Länkens fragment skickas inte med GET till servern och tas omedelbart bort från adressfältets historik. Beviset hålls endast i komponentminnet. Inga tredjepartsresurser laddas. GET och förhandsgranskning konsumerar aldrig engångsbeviset. POST kräver samma origin, JSON och ett strikt validerat objekt. Endast signup, recovery och invite tillåts; övriga typer, extra parametrar och klientvalda redirects avvisas. Redirect till `/app?activated=1` för signup respektive `/app?recovery=1` för recovery/invite. Vanlig MFA och serverauktoriserade mandat gäller därefter.

## Mallbyte krävs i Supabase
Behåll befintlig HTML, ämnesrad och avsändare. Ersätt samtliga `{{ .ConfirmationURL }}` i respektive mall — knappens href, reservlänkens href och reservlänkens synliga text — med:

- Confirm sign up: `https://www.plockivo.com/auth/confirm#token_hash={{ .TokenHash }}&type=signup`
- Reset password: `https://www.plockivo.com/auth/confirm#token_hash={{ .TokenHash }}&type=recovery`
- Invite user: `https://www.plockivo.com/auth/confirm#token_hash={{ .TokenHash }}&type=invite`

I HTML-attribut kan ampersand skrivas `&amp;type=`. Ändra inte TokenHash-variabeln. Den nya verifieringen använder inga klientstyrda redirects eller RedirectTo. Gamla utskick får inte betraktas som migrerade: de behåller sina gamla länkar och behöver ersättas med nytt utskick. Bevis är engångsbevis och återöppning efter användning ska ge ett begripligt fel. Omladdning av landningssidan kräver att ursprungliga mejllänken öppnas igen.

## Verifiering och begränsningar
Tre fokuserade tester PASS: portabel parsning utan PKCE-lager, strikt typ-/parametervalidering och fasta destinationsvägar, samt utgånget/återanvänt/sessionslöst bevis och maskerad driftstörning. Inga riktiga mejl, användare, Auth-sessioner eller externa effekter skapade. Verklig SMTP → mejl → separat webbläsare/enhet → verifiering → lösenordsbyte återstår och kan inte anges som PASS före testkontot finns. Huvudagenten kör sammanförd typkontroll, tester och bygge före release.

## Primärkällor
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://github.com/supabase/auth/blob/master/internal/api/verify.go

Supabase-skill läst. Changelog.md-försök via webbverktyget gav unsupported markdown content-type; aktuella officiella API-/template-/SSR-dokument och installerad auth-js typdefinition användes för API-verifieringen.
