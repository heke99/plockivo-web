# PRINT-CONFIRMATION-028

2026-10-26: Utskrift av redan behörighetskontrollerad köpbekräftelse. Knapp visas endast efter status ready och dokument. Ingen ny dataendpoint, PDF-tjänst, utskick eller extern flik. Dokumentet renderas med React-escaping i en tillfällig portal direkt under body; endast portalen skrivs ut via scoped print-CSS och en tillfällig body-klass. Därmed inga andra order, navigering eller personliga vyer i utskriften. Portal töms efter afterprint eller när dokumentet laddas om/komponenten lämnas. Testvarning och förbud mot faktura/följesedel/fysisk utlämning kvarstår. Utskrift använder webbläsarens utskriftsdialog, som kan erbjuda Spara som PDF.

Ej byggt eller publicerat av delagenten enligt ägarfördelningen. Parent kör sammanförd typkontroll/build och UI-verifiering. Fysisk skrivare och mobil OS-utskrift ännu ej verifierade.
