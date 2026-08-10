# Vintage Mission

Arbeitswerkzeug für den Vintage-Webshop zu dritt: Fahrplan, Aufgaben, Kaufentscheid
im Laden, Artikel-Log, Zahlen und Rechtsteil. Läuft auf dem iPhone als App und im
Browser am Rechner.

## Installation auf dem iPhone

1. Die App-URL in **Safari** öffnen
2. **Teilen** → **«Zum Home-Bildschirm»**
3. Startet mit eigenem Icon, im Vollbild und funktioniert offline

Am Rechner reicht die URL im Browser — ab 900 px Breite erscheint statt der
Tab-Leiste eine Seitennavigation.

## Was drin ist

| Bereich | Zweck |
|---|---|
| Cockpit | Durchverkaufsquote, DB je Stück, Stundenlohn, gebundenes Kapital, Gate-Ampel, fällige Aufgaben |
| Fahrplan | Sechs Phasen vom 10.08.2026 bis zum Gate am 04.01.2027, plus die Nebenstränge Uhren und Bänder |
| Aufgaben | 53 Startaufgaben mit Person, Frist und Aufwand — änderbar, erweiterbar |
| Artikel | Ein Datensatz je Stück: Einkauf, Bearbeitungszeit, Einstelldatum, Kanal, Verkauf, Gebühren |
| Kaufentscheid | Elf harte Kriterien plus Preisprüfung, Ampel «Kaufen / Nicht kaufen» — für den Laden gedacht |
| Zahlen | Regler für alle Annahmen, Break-even-Quoten, Empfindlichkeitstabelle, Plan gegen Ist |
| Stundenkonto | Wer wie viel gearbeitet hat, umgerechnet in die Vorwegvergütung |
| Entscheide | Beschlüsse mit Datum und Begründung |
| Recht und Admin | Gesellschaft, Uhren, RAV, Echtheit, Shop, Marke, Versicherung |
| Strategie | Warum der Plan so aussieht |

## Die Rechnung dahinter

Deckungsbeitrag **pro beschafftem Stück**, nicht pro verkauftem:

```
DB = Quote × VK − EK − Quote × variable Kosten
```

Mit VK 280, EK 90, variablen Kosten 20 und 50 % Quote ergibt das CHF 40, auf
75 Minuten Arbeit CHF 32 pro Stunde. Die beiden Schwellen:

- **kein Verlust ab** `EK / (VK − Kvar)` → 34,6 %
- **Arbeit bezahlt ab** `(EK + Stundensatz × Stunden) / (VK − Kvar)` → 46,6 %

Die geplanten 50 % liegen gut drei Punkte über dem Punkt, an dem die Arbeit
gratis ist. Deshalb entscheidet die Quote, nicht der Preis.

## Daten

- Alles liegt **lokal auf dem Gerät** (localStorage), nichts geht an einen Server
- Austausch zu dritt über **Einstellungen → Backup schreiben / einlesen**.
  Wer zuletzt einliest, überschreibt — also nicht gleichzeitig an denselben
  Zahlen arbeiten
- **Katalog für den Shop** exportiert die eingestellten Artikel als JSON, damit
  die Verkaufsseite denselben Datenstand nutzt
- **Artikel als CSV** für Buchhaltung und Tabellenkalkulation

## Dateien

```
index.html    Gerüst und Navigation
app.css       Design-System
data.js       Startdaten: Phasen, Aufgaben, Kriterien, Rechtsteil, Strategietext
app.js        Zustand, Rechnen, Rendern
sw.js         Service Worker (VERSION bei jedem Deployment erhöhen)
```

`build-standalone.py` erzeugt daraus `vintage-mission.html` — eine einzelne Datei
ohne Abhängigkeiten, die sich verschicken und direkt vom Dateisystem öffnen lässt.
Nach jeder Änderung an den vier Quelldateien neu ausführen:

```
python3 build-standalone.py
```

## Deployment

Statisches Hosting, kein Build nötig. Bei GitHub Pages liegt die App unter
`…/vintage/`. Bei jedem Deployment die `VERSION` in `sw.js` erhöhen, sonst
behalten installierte Apps die alte Fassung.
