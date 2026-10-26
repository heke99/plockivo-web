# DEVICE-CHECK-029 — Enhetskontroll

2026-10-26. Publik `/device-check` låter användaren kontrollera säker kontext, kamera-API och inbyggt BarcodeDetector-stöd/formats via eget knapptryck. Separat uttrycklig knapp begär endast video, inga mikrofonspår; alla erhållna spår stoppas direkt i finally. Pågående kameraresultat efter unmount stoppas utan att uppdatera UI. Ingen bild visas, sparas eller skickas. Inga nya beroenden.

Kamera-API finns är inte bevis på fysisk kamera eller tillstånd. Inbyggt formatstöd är inte bevis på riktig kodavläsning. Texten skiljer dessa tillstånd och ger manuell sökning/kodinmatning som alternativ. Kamera nekad/saknas/upptagen hanteras med konkreta instruktioner. Sidan länkar `/app` och `/forgot-password`.

Parent kör sammanförd typkontroll/bygge och eventuell browserkontroll. Fysisk telefonkamera och faktisk kodavläsning har inte provats i detta delarbete. Inga konton skapade och inget utskick.
