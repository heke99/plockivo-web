# REGISTRATION-050 — personligt konto och aktuell Auth-policy

Publik /register skapar endast personkonto efter e-postverifiering. Ingen handlarrelation, roll, kredit eller inköpsrätt skapas. /api/register kräver same-origin, JSON, strikt email/password-schema, högst4KiB och avvisar befintlig session409. UI upprepar lösenordet och länkar till /start efter verifiering/inloggning. Inget fabricerat villkorssamtycke.

Servern läser före signUp aktuella publika /auth/v1/settings med publishable apikey, no-store, redirect:error och7s timeout. Endast exakta booleska external.email=true, disable_signup=false och mailer_autoconfirm=false tillåter registrering. Saknade flaggor, truthy strings, okänd policy och outage stänger flödet med503. AUTH_EMAIL_DELIVERY_ENABLED måste dessutom vara true; den tidigare AUTH_EMAIL_CONFIRMATIONS_VERIFIED-flaggan används inte som bevis i invitations-onboarding-route längre. Inbjudningsflödets token/email-precheck är oförändrat.

Auth-provider-src-källa granskad av root: https://raw.githubusercontent.com/supabase/auth/master/internal/api/settings.go. Policyläsningen bevisar inställningar, inte att ett mejl har levererats. SignUp använder fast APP_ORIGIN/auth/callback?mode=activation. Oväntad automatiskt inloggad session stängs lokalt och ger503. Svar lämnar inte ut providerfel, lösenord eller token.

Verifierat: fyra fokuserade enhetstester PASS inklusive exakta flags, transport/no-cache, outage, payload-injektion, stängt läge utan signup och oväntad session. Webbens typkontroll och diffkontroll PASS. Inga faktiska konton/mejl skapade av delagenten. Root äger gemensamt bygge, browser, eventuell verklig e-postverifiering och publicering.
