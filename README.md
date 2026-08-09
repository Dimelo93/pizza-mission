# 🍕 Pizza Foodtruck Mission — iPhone-App (PWA)

Mobile Version des Mission-Control-Dashboards von Jan Wälchli: Batch-Log mit Fotos,
Teig-Rechner, Teig-Timer, Kostenkalkulation, Budget, Fahrplan und Wirtschaftlichkeitsrechner.

## Installation auf dem iPhone

1. Die App-URL in **Safari** öffnen
2. **Teilen** (Quadrat mit Pfeil) → **«Zum Home-Bildschirm»**
3. Fertig — die App startet mit eigenem Icon, im Vollbild und funktioniert offline

## Daten

- Alle Daten liegen **lokal auf dem Gerät** (localStorage + IndexedDB für Fotos)
- Backup/Restore über **Mehr → Einstellungen** — die Backup-Dateien sind mit
  `Mission_Control.html` am PC in beide Richtungen kompatibel
- Fotos sind nur im «Backup inkl. Fotos» enthalten

## Deployment

Statisches Hosting (GitHub Pages). Bei jedem Deployment die `VERSION` in `sw.js`
erhöhen, damit installierte Apps das Update erkennen.
