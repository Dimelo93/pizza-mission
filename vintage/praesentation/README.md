# Präsentation für Luan und Mattia

16 Folien, rund 25 Minuten. Reihenfolge ist bewusst nicht die des Fahrplans:
zuerst was es kostet, dann was realistisch rauskommt, erst danach der Plan.

| Datei | Zweck |
|---|---|
| `Vintage-Mission-Praesentation.pptx` | zum Präsentieren und Ändern, mit Notizen je Folie |
| `Vintage-Mission-Praesentation.pdf`  | zum Verschicken |
| `build.js` | erzeugt die Folien neu |
| `app-*.png` | Bildschirmfotos der App für Folie 15 |

## Neu erzeugen

```
npm install pptxgenjs
node build.js
```

Die Bildschirmfotos stammen aus der App unter `../`. Ändert sich dort das
Aussehen, gehören sie neu aufgenommen — sonst zeigt Folie 15 einen alten Stand.
