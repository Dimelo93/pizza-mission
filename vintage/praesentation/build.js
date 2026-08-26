const pptxgen = require('pptxgenjs');
const path = require('path');

const DIR = __dirname;
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.3 × 7.5
pres.author = 'Jan Wälchli';
pres.title = 'Vintage Mission';

const W = 13.3, H = 7.5;

/* ---- Palette: hell, ruhig, Schwarz als einzige Farbe, Sand als Akzent ---- */
const INK        = '1A1917';
const INK_SOFT   = '6B655C';
const INK_FAINT   = '9A938A';
const PAPER      = 'FAF8F4';
const WHITE      = 'FFFFFF';
const LINE       = 'E4DED3';
const SAND       = 'C2AD8C';
const GO         = '3F6B4A';
const HOLD       = 'A8761E';
const STOP       = 'A33D2E';
const ON_DARK    = 'F0EBE2';
const ON_DARK_SOFT = 'A9A196';

const DISPLAY = 'Cambria';
const BODY    = 'Calibri';

const card = () => ({ fill: { color: WHITE }, line: { color: LINE, width: 0.75 } });
const cardDark = () => ({ fill: { color: '241F1B' }, line: { color: '3A342C', width: 0.75 } });

/* Motiv: der Bogen aus dem App-Icon — Rechteck plus Halbkreis oben. */
function arch(slide, x, y, w, color) {
  const h = w * 1.45;
  const r = w / 2;
  slide.addShape(pres.ShapeType.rect,    { x, y: y + r, w, h: h - r, fill: { color } });
  slide.addShape(pres.ShapeType.ellipse, { x, y, w, h: w, fill: { color } });
}

function eyebrow(slide, text, color) {
  slide.addText(text.toUpperCase(), {
    x: 0.7, y: 0.52, w: 11.9, h: 0.3, fontSize: 11, fontFace: BODY,
    color: color || INK_FAINT, charSpacing: 3, margin: 0
  });
}

function title(slide, text, color) {
  slide.addText(text, {
    x: 0.7, y: 0.85, w: 11.9, h: 0.95, fontSize: 38, fontFace: DISPLAY,
    color: color || INK, margin: 0, valign: 'top'
  });
}

function lead(slide, text, y, color, size) {
  slide.addText(text, {
    x: 0.7, y: y || 1.82, w: 11.0, h: 0.7, fontSize: size || 16, fontFace: BODY,
    color: color || INK_SOFT, margin: 0, lineSpacing: 22
  });
}

function light(eb, tt) {
  const s = pres.addSlide();
  s.background = { color: PAPER };
  eyebrow(s, eb);
  title(s, tt);
  return s;
}

function dark(eb, tt) {
  const s = pres.addSlide();
  s.background = { color: INK };
  eyebrow(s, eb, ON_DARK_SOFT);
  title(s, tt, ON_DARK);
  return s;
}

/* Kennzahlen-Kachel */
function stat(slide, o) {
  slide.addShape(pres.ShapeType.rect, Object.assign({ x: o.x, y: o.y, w: o.w, h: o.h },
    o.dark ? cardDark() : card()));
  slide.addText(o.label.toUpperCase(), {
    x: o.x + 0.3, y: o.y + 0.28, w: o.w - 0.6, h: 0.26, fontSize: 10, fontFace: BODY,
    color: o.dark ? ON_DARK_SOFT : INK_FAINT, charSpacing: 2, margin: 0
  });
  slide.addText(o.value, {
    x: o.x + 0.3, y: o.y + 0.58, w: o.w - 0.6, h: 0.6, fontSize: o.big || 34, fontFace: DISPLAY,
    color: o.color || (o.dark ? ON_DARK : INK), margin: 0
  });
  if (o.sub) {
    slide.addText(o.sub, {
      x: o.x + 0.3, y: o.y + 1.2, w: o.w - 0.6, h: o.h - 1.4, fontSize: 12, fontFace: BODY,
      color: o.dark ? ON_DARK_SOFT : INK_SOFT, margin: 0, valign: 'top', lineSpacing: 15
    });
  }
}

/* Inhaltskarte mit Kopfzeile und Fliesstext */
function panel(slide, o) {
  slide.addShape(pres.ShapeType.rect, Object.assign({ x: o.x, y: o.y, w: o.w, h: o.h },
    o.dark ? cardDark() : card()));
  const tw = o.w - 0.64, tx = o.x + 0.32;
  let ty = o.y + 0.26;
  if (o.kicker) {
    slide.addText(o.kicker.toUpperCase(), {
      x: tx, y: ty, w: tw, h: 0.24, fontSize: 10, fontFace: BODY,
      color: o.kickerColor || SAND, charSpacing: 2, margin: 0
    });
    ty += 0.30;
  }
  slide.addText(o.head, {
    x: tx, y: ty, w: tw, h: o.headH || 0.42, fontSize: o.headSize || 20,
    fontFace: DISPLAY, color: o.headColor || (o.dark ? ON_DARK : INK), margin: 0
  });
  ty += (o.headH || 0.42) + 0.10;
  if (o.sub) {
    slide.addText(o.sub, {
      x: tx, y: ty, w: tw, h: 0.28, fontSize: 13, fontFace: BODY,
      color: o.dark ? ON_DARK : INK, bold: true, margin: 0
    });
    ty += 0.34;
  }
  if (o.body) {
    slide.addText(o.body, {
      x: tx, y: ty, w: tw, h: o.y + o.h - ty - 0.24, fontSize: o.bodySize || 13.5,
      fontFace: BODY, color: o.dark ? ON_DARK_SOFT : INK_SOFT, margin: 0, valign: 'top', lineSpacing: 19
    });
  }
}

/* Kompakte Karte fuer die drei Schwellen — enger als panel() */
function mini(slide, o) {
  slide.addShape(pres.ShapeType.rect, Object.assign({ x: o.x, y: o.y, w: o.w, h: o.h }, card()));
  slide.addText(o.kicker.toUpperCase(), {
    x: o.x + 0.3, y: o.y + 0.16, w: o.w - 0.6, h: 0.24, fontSize: 10, fontFace: BODY,
    color: o.color, charSpacing: 2, margin: 0
  });
  slide.addText(o.head, {
    x: o.x + 0.3, y: o.y + 0.43, w: o.w - 0.6, h: 0.36, fontSize: 19, fontFace: DISPLAY,
    color: o.color, margin: 0
  });
  slide.addText(o.body, {
    x: o.x + 0.3, y: o.y + 0.82, w: o.w - 0.6, h: 0.34, fontSize: 12, fontFace: BODY,
    color: INK_SOFT, margin: 0
  });
}

/* ====================================================== 1 — Titel ======== */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  arch(s, 0.72, 0.7, 0.62, SAND);
  s.addText('Für Luan und Mattia · 10. August 2026', {
    x: 0.7, y: 2.5, w: 10, h: 0.3, fontSize: 12, fontFace: BODY, color: ON_DARK_SOFT,
    charSpacing: 3, margin: 0
  });
  s.addText('Vintage Mission', {
    x: 0.66, y: 2.95, w: 11, h: 1.3, fontSize: 66, fontFace: DISPLAY, color: ON_DARK, margin: 0
  });
  s.addText('Was wir vorhaben, was es kostet und was ich von euch brauche.', {
    x: 0.7, y: 4.35, w: 8.6, h: 0.5, fontSize: 19, fontFace: BODY, color: ON_DARK_SOFT, margin: 0
  });
  s.addShape(pres.ShapeType.line, { x: 0.7, y: 5.35, w: 4.2, h: 0, line: { color: '3A342C', width: 1 } });
  s.addText('Kleider zuerst.   Uhren zweitens.   Bänder zuletzt.', {
    x: 0.7, y: 5.6, w: 9, h: 0.4, fontSize: 14, fontFace: BODY, color: SAND, charSpacing: 1, margin: 0
  });
  s.addNotes('Rahmen setzen: Das ist kein Vorschlag zum Abnicken, sondern eine Rechnung und ein Terminplan. Am Ende brauche ich drei Zusagen. Dauer rund 25 Minuten.');
}

/* ============================================ 2 — Der Entscheid ========== */
{
  const s = light('Ausgangslage', 'Der Foodtruck ist parkiert');
  lead(s, 'Ein Webshop für exklusives Vintage im oberen Segment — Designerstücke, selbst eingekauft und weiterverkauft. Drei Stränge, in dieser Reihenfolge und nicht gleichzeitig.');

  const items = [
    { n: '1', h: 'Kleider', k: 'Ab sofort',
      b: 'Eigene Ware, eigenes Kapital. Das ist das Geschäft, das wir lernen müssen: einkaufen, bewerten, fotografieren, bepreisen. Alles davon überträgt sich später.' },
    { n: '2', h: 'Uhren', k: 'Ab November',
      b: 'Über Jans Händlerkollegen, gegen Provision, ohne eigenen Wareneinkauf. Kein Kapital gebunden — dafür ein Haftungsthema, das sauber geregelt sein muss.' },
    { n: '3', h: 'Bänder', k: 'Ab Frühjahr 2027',
      b: 'Eigene Marke, extern produziert. Kein Handel mit Fremdmarken-Bändern. Vier Artikel zum Start, nicht zwanzig.' }
  ];
  items.forEach((it, i) => {
    const x = 0.7 + i * 4.05;
    panel(s, { x, y: 2.85, w: 3.75, h: 3.5, kicker: it.k, head: it.h, headSize: 26, headH: 0.5, body: it.b });
    s.addText(it.n, {
      x: x + 3.75 - 0.75, y: 2.95, w: 0.5, h: 0.5, fontSize: 30, fontFace: DISPLAY,
      color: LINE, align: 'right', margin: 0
    });
  });
  s.addText('«Zara, Mykonos, clean» beschreibt das Website-Design — nicht das Sortiment.', {
    x: 0.7, y: 6.6, w: 11.9, h: 0.35, fontSize: 13, fontFace: BODY, color: INK_FAINT, italic: true, margin: 0
  });
  s.addNotes('Wichtig für die zwei: Die Reihenfolge ist kein Geschmack, sondern Kapital- und Risikologik. Kleider binden Geld, Uhren binden Haftung, Bänder binden am meisten Geld. Deshalb genau diese Reihenfolge.');
}

/* ============================================ 3 — Was es kostet ========== */
{
  const s = light('Der Einsatz', 'Was es euch kostet');
  lead(s, 'Kein Vertrag über Jahre, kein Kredit, keine Kündigung. Ein befristeter Versuch mit einem festen Enddatum.');

  stat(s, { x: 0.7,  y: 2.75, w: 2.85, h: 2.0, label: 'Geld, je Person', value: 'CHF 900', sub: 'einmalig, zusammen CHF 2\'700' });
  stat(s, { x: 3.75, y: 2.75, w: 2.85, h: 2.0, label: 'Zeit pro Woche', value: '5 h / 3 h', sub: 'Luan / Mattia · Jan 15 h' });
  stat(s, { x: 6.80, y: 2.75, w: 2.85, h: 2.0, label: 'Bis zum Entscheid', value: '90 Tage', sub: 'Messung ab 28.09., Gate 04.01.' });
  stat(s, { x: 9.85, y: 2.75, w: 2.75, h: 2.0, label: 'Schlimmster Fall', value: 'CHF 900', sub: 'mehr kann keiner verlieren', color: STOP });

  panel(s, { x: 0.7, y: 5.05, w: 11.9, h: 1.85,
    kicker: 'Wichtig', kickerColor: STOP,
    head: 'Jeder Fehlkauf kostet CHF 90, nicht CHF 6.',
    headSize: 22, headH: 0.45,
    body: 'Im oberen Segment ist der einzelne Griff daneben teuer. Zehn Fehlkäufe sind eine ganze Einlage. Deshalb kauft niemand nach Gefühl — es gibt eine schriftliche Kriterienliste, und die läuft am Handy mit.' });
  s.addNotes('Hier nicht beschönigen. Die 900 sind echtes Geld, das weg sein kann. Aber es ist gedeckelt und befristet — das ist der Punkt, den beide hören müssen.');
}

/* ============================================ 4 — Die Rechnung =========== */
{
  const s = light('Das Modell', 'Was ein Stück verdient');
  lead(s, 'Gerechnet pro beschafftem Stück, nicht pro verkauftem. Nur so zählt jeder Ladenhüter mit — und genau daran scheitert die Rechnung sonst.');

  const steps = [
    { v: 'CHF 280', l: 'Verkaufspreis', s: 'Durchschnitt im oberen Segment' },
    { v: '× 50 %', l: 'Durchverkaufsquote', s: 'die Hälfte wird in 6 Monaten verkauft' },
    { v: '− CHF 90', l: 'Einkauf', s: 'fällt für jedes Stück an, auch für die unverkauften' },
    { v: '− CHF 10', l: 'Versand und Gebühren', s: 'CHF 20 je verkauftem Stück, anteilig' }
  ];
  steps.forEach((st, i) => {
    const x = 0.7 + i * 2.62;
    s.addText(st.v, { x, y: 2.9, w: 2.4, h: 0.55, fontSize: 27, fontFace: DISPLAY, color: INK, margin: 0 });
    s.addText(st.l, { x, y: 3.5, w: 2.4, h: 0.3, fontSize: 12, fontFace: BODY, color: INK, bold: true, margin: 0 });
    s.addText(st.s, { x, y: 3.82, w: 2.4, h: 0.7, fontSize: 11.5, fontFace: BODY, color: INK_SOFT, margin: 0, lineSpacing: 15 });
  });
  s.addShape(pres.ShapeType.rect, { x: 11.18, y: 2.72, w: 1.42, h: 1.9, fill: { color: INK } });
  s.addText('CHF 40', { x: 11.18, y: 3.05, w: 1.42, h: 0.5, fontSize: 24, fontFace: DISPLAY, color: ON_DARK, align: 'center', margin: 0 });
  s.addText('je beschafftem\nStück', { x: 11.18, y: 3.6, w: 1.42, h: 0.7, fontSize: 11, fontFace: BODY, color: ON_DARK_SOFT, align: 'center', margin: 0, lineSpacing: 14 });

  s.addShape(pres.ShapeType.line, { x: 0.7, y: 5.0, w: 11.9, h: 0, line: { color: LINE, width: 1 } });

  panel(s, { x: 0.7, y: 5.25, w: 5.85, h: 1.65, head: 'CHF 32 pro Arbeitsstunde', headSize: 22, headH: 0.45,
    body: '75 Minuten pro Stück: suchen, prüfen, waschen, dämpfen, fotografieren, einstellen, verpacken.' });
  panel(s, { x: 6.75, y: 5.25, w: 5.85, h: 1.65, head: 'CHF 1\'200 für die ganze Charge', headSize: 22, headH: 0.45,
    body: '30 Stück über sechs Monate, bei rund 37 Arbeitsstunden zu dritt.' });
  s.addNotes('Die entscheidende Zeile ist «pro beschafftem Stück». Wer pro verkauftem Stück rechnet, kommt auf 170 Franken Marge und fühlt sich reich — die 15 unverkauften Stücke im Keller tauchen in der Rechnung nicht auf.');
}

/* ========================================== 5 — Die zwei Schwellen ======= */
{
  const s = light('Der Hebel', 'Alles hängt an der Durchverkaufsquote');
  lead(s, 'Nicht am Preis. Ein höherer Verkaufspreis bringt wenig, wenn die Stücke liegen bleiben — eine höhere Quote verändert alles.');

  s.addChart(pres.ChartType.bar, [{
    name: 'Deckungsbeitrag je beschafftem Stück',
    labels: ['30 %', '40 %', '50 %', '60 %', '70 %', '80 %'],
    values: [-12, 14, 40, 66, 92, 118]
  }], {
    x: 0.6, y: 2.75, w: 7.5, h: 3.85,
    barDir: 'col', barGapWidthPct: 55,
    varyColors: true,
    chartColors: [STOP, HOLD, GO, GO, GO, GO],
    showTitle: false, showLegend: false,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 12,
    dataLabelFontFace: BODY, dataLabelColor: INK_SOFT, dataLabelFormatCode: '#,##0" CHF"',
    catAxisLabelColor: INK_SOFT, catAxisLabelFontFace: BODY, catAxisLabelFontSize: 12,
    catAxisLineShow: false, catGridLine: { style: 'none' },
    valAxisLabelColor: INK_FAINT, valAxisLabelFontFace: BODY, valAxisLabelFontSize: 10,
    valAxisLineShow: false, valGridLine: { color: LINE, size: 0.75 },
    valAxisMaxVal: 140, valAxisMinVal: -40
  });

  mini(s, { x: 8.4, y: 2.75, w: 4.2, h: 1.25, color: STOP, kicker: 'Unter 34,6 %',
    head: 'Verlust', body: 'Arbeitszeit noch nicht gezählt.' });
  mini(s, { x: 8.4, y: 4.15, w: 4.2, h: 1.25, color: HOLD, kicker: 'Unter 46,6 %',
    head: 'Wir arbeiten gratis', body: 'Eigene Stunde zu CHF 25 gerechnet.' });
  mini(s, { x: 8.4, y: 5.55, w: 4.2, h: 1.25, color: GO, kicker: 'Bei 70 %',
    head: 'CHF 74 pro Stunde', body: 'Dann trägt sich das Ganze.' });

  s.addText('Geplant sind 50 %. Das liegt gut drei Punkte über dem Punkt, an dem unsere Arbeit gratis ist.', {
    x: 0.6, y: 7.0, w: 11.9, h: 0.35, fontSize: 13, fontFace: BODY, color: INK, italic: true, margin: 0
  });
  s.addNotes('Das ist die wichtigste Folie. Die 50 Prozent sind kein komfortabler Plan, sondern knapp. Wer das versteht, versteht auch, warum die Einkaufskriterien so streng sind.');
}

/* ====================================== 6 — Was wirklich rausschaut ====== */
{
  const s = dark('Ehrlich gerechnet', 'Die erste Charge macht uns nicht reich');
  lead(s, 'Damit niemand nach drei Monaten enttäuscht ist: so sieht der beste realistische Fall aus.', 1.9, ON_DARK_SOFT, 17);

  stat(s, { dark: true, x: 0.7,  y: 2.8, w: 3.85, h: 1.85, label: 'Deckungsbeitrag gesamt', value: 'CHF 1\'200', sub: 'über sechs Monate' });
  stat(s, { dark: true, x: 4.72, y: 2.8, w: 3.85, h: 1.85, label: 'Pro Kopf', value: 'CHF 400', sub: 'vor Steuern, nach 37 Arbeitsstunden' });
  stat(s, { dark: true, x: 8.75, y: 2.8, w: 3.85, h: 1.85, label: 'Was sie wirklich liefert', value: 'Eine Zahl', sub: 'die Durchverkaufsquote, die heute niemand kennt' });

  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 5.05, w: 11.9, h: 1.7, fill: { color: SAND } });
  s.addText('Die erste Charge ist ein Messinstrument, kein Einkommen.', {
    x: 1.1, y: 5.32, w: 11.1, h: 0.5, fontSize: 24, fontFace: DISPLAY, color: '241F1B', margin: 0
  });
  s.addText('Verdient wird ab Charge zwei — mit bekannter Quote und geschärften Kriterien. Wer die 400 Franken als Lohn betrachtet, hat den Zweck des Versuchs missverstanden.', {
    x: 1.1, y: 5.88, w: 11.1, h: 0.6, fontSize: 14, fontFace: BODY, color: '3A2F22', margin: 0, lineSpacing: 19
  });
  s.addNotes('Diese Folie ist die wichtigste für die Beziehung. Wenn ich sie weglasse und im Januar kommen 400 Franken raus, fühlen sich beide betrogen. Sage ich sie heute, ist das Ergebnis erwartungsgemäss.');
}

/* ========================================= 7 — Kanal und Kontrollgruppe == */
{
  const s = light('Der Verkauf', '20 Stück im eigenen Shop, 10 auf Ricardo');
  lead(s, 'Eine neue Website hat am ersten Tag null Besucher. Verkaufen wir dann wenig, wissen wir nicht, ob der Einkauf schlecht war oder ob schlicht niemand da war — und genau dafür machen wir den Versuch.');

  panel(s, { x: 0.7, y: 2.9, w: 5.85, h: 2.75, kicker: '20 Stück', head: 'Eigener Shop',
    headSize: 24, headH: 0.48,
    body: 'Eigene Marke, eigene Kunden, keine Plattformgebühr. Zahlung über Stripe: TWINT 1.9 % plus 30 Rappen, Karten 2.9 % plus 30 Rappen, keine Grundgebühr. Instagram läuft ab Woche 1 mit, nicht erst zum Launch.' });
  panel(s, { x: 6.75, y: 2.9, w: 5.85, h: 2.75, kicker: '10 Stück · Kontrollgruppe', head: 'Ricardo',
    headSize: 24, headH: 0.48, kickerColor: SAND,
    body: 'Gleiche Preise, quer durch Marken und Preislagen ausgewählt. Ricardo hat die Nachfrage, die wir noch nicht haben. Wer hier die Ladenhüter abschiebt, macht die Messung wertlos.' });

  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 5.9, w: 11.9, h: 1.0, fill: { color: 'F1EDE6' } });
  s.addText('Nach 90 Tagen: verkauft Ricardo deutlich besser, ist unser Problem die Reichweite und der Einkauf stimmt. Verkauft Ricardo auch schlecht, war der Einkauf falsch — und die schönste Website hätte daran nichts geändert.', {
    x: 1.05, y: 6.1, w: 11.2, h: 0.65, fontSize: 14, fontFace: BODY, color: INK, margin: 0, lineSpacing: 19
  });
  s.addNotes('Falls jemand fragt, warum wir überhaupt auf eine Plattform gehen, wenn wir doch eine eigene Seite bauen: weil zehn Stück auf Ricardo der Preis dafür sind, dass wir im Januar eine belastbare Antwort haben statt einer Vermutung.');
}

/* ================================================ 8 — Wer macht was ====== */
{
  const s = light('Die Rollen', 'Wer macht was — und wie viel');
  lead(s, 'Ungleiche Zeit ist kein Problem. Ungeklärte Erwartung schon. Deshalb steht hier, womit jeder rechnen kann.');

  const people = [
    { n: 'Jan', h: '15 h / Woche', k: 'Motor',
      b: 'Alles mit Termindruck: Einkauf, Aufbereitung, Fotografie, Shop-Inhalte, Zahlen, RAV. Hat aktuell am meisten Zeit und macht es gern.' },
    { n: 'Luan', h: '5 h / Woche', k: 'Handel',
      b: 'Alles, was Verhandlung und Verlässlichkeit braucht, aber planbar terminiert werden kann: der Uhrenhändler, die Verträge, Preise, Buchhaltung. Flexibel gelegt.' },
    { n: 'Mattia', h: '3 h / Woche', k: 'Prüfung',
      b: 'Asynchrone Arbeit ohne Frist: Echtheitsrecherche, Vergleichspreise, Produkttexte, Zweitmeinung per Foto bei Einkäufen über CHF 200. In den ersten Wochen auch mal null — so eingeplant.' }
  ];
  people.forEach((p, i) => {
    const x = 0.7 + i * 4.05;
    panel(s, { x, y: 2.9, w: 3.75, h: 3.6, kicker: p.k, head: p.n, headSize: 28, headH: 0.55, sub: p.h, body: p.b });
  });
  s.addText('Fällt jemand aus, wird umverteilt statt nachgetragen. Auch das steht im Gesellschaftsvertrag.', {
    x: 0.7, y: 6.75, w: 11.9, h: 0.35, fontSize: 13, fontFace: BODY, color: INK_FAINT, italic: true, margin: 0
  });
  s.addNotes('Mattia direkt ansprechen: Deine drei Stunden sind so geschnitten, dass sie um zwei Uhr nachts am Handy erledigt werden können. Kein Termin, keine Übergabe, keine Blockade für die anderen.');
}

/* ============================================ 9 — Faire Verteilung ======= */
{
  const s = light('Das Geld', 'Wie wir teilen bei ungleicher Arbeit');
  lead(s, 'Gleiche Anteile bei ungleicher Arbeit halten genau so lange, bis der Erste rechnet. Deshalb zwei getrennte Töpfe und eine feste Reihenfolge.');

  const steps = [
    { n: 'Zuerst', h: 'Einlagen zurück', b: 'Jeder bekommt seine CHF 900 zurück, bevor von Gewinn die Rede ist. Das Kapital ist bei allen gleich, also bleibt es gleich behandelt.' },
    { n: 'Dann', h: 'Stunden × CHF 25', b: 'Jeder erfasst seine Zeit in der App. Die Stunden werden als Vorwegvergütung aus dem Gewinn abgegolten. Kein Gewinn, keine Vergütung — es entsteht nie eine Lohnschuld.' },
    { n: 'Zuletzt', h: 'Rest zu je einem Drittel', b: 'Was übrig bleibt, wird gedrittelt. Wer mehr gearbeitet hat, hat das über die Stunden schon bekommen; wer weniger konnte, verliert seinen Anteil nicht.' }
  ];
  steps.forEach((st, i) => {
    const x = 0.7 + i * 4.05;
    panel(s, { x, y: 2.9, w: 3.75, h: 3.3, kicker: st.n, head: st.h, headSize: 21, headH: 0.72, body: st.b });
  });
  s.addText('Für Jan zusätzlich: diese Vergütung ist gegenüber dem RAV Zwischenverdienst und wird gemeldet.', {
    x: 0.7, y: 6.45, w: 11.9, h: 0.35, fontSize: 13, fontFace: BODY, color: INK_FAINT, italic: true, margin: 0
  });
  s.addNotes('Der Punkt, der Streit vermeidet: Arbeit und Kapital werden getrennt abgegolten. Niemand muss sich schlecht fühlen, weil er weniger Zeit hat, und niemand arbeitet für die anderen gratis.');
}

/* ================================================= 10 — Fahrplan ========= */
{
  const s = light('Der Plan', 'Von heute bis zum Entscheid');

  const rows = [
    ['Phase 0', 'Fundament',            '10. – 16. Aug',        'RAV, Kriterien, Rollen, Domain. Kein Franken ausgegeben.'],
    ['Phase 1', 'Verträge und Struktur', '17. – 30. Aug',        'Gesellschaftsvertrag, Uhrenmodell, Konto, Echtheitsprotokoll.'],
    ['Phase 2', 'Ware und Shop',        '31. Aug – 27. Sep',     '30 Stück beschaffen und fotografieren. Website entsteht parallel.'],
    ['Phase 3', 'Launch',               '28. Sep – 4. Okt',      'Alles online. Tag 0 der Messung.'],
    ['Phase 4', 'Verkaufen und messen', '5. Okt – 27. Dez',      '90 Tage Daten. Kein Nachkauf. Uhren ab November, Bänder-Recherche ab November.'],
    ['Phase 5', 'Gate',                 '4. Januar 2027',        'Entscheid nach der Regel, die wir heute festlegen.']
  ];
  const y0 = 2.05, rh = 0.75;
  rows.forEach((r, i) => {
    const y = y0 + i * rh;
    if (i % 2 === 0) s.addShape(pres.ShapeType.rect, { x: 0.7, y, w: 11.9, h: rh, fill: { color: WHITE } });
    s.addText(r[0], { x: 0.95, y: y + 0.16, w: 1.1, h: 0.3, fontSize: 10, fontFace: BODY, color: INK_FAINT, charSpacing: 1.5, margin: 0 });
    s.addText(r[1], { x: 2.05, y: y + 0.1, w: 2.6, h: 0.42, fontSize: 17, fontFace: DISPLAY, color: INK, margin: 0 });
    s.addText(r[2], { x: 4.7,  y: y + 0.17, w: 2.0, h: 0.36, fontSize: 12.5, fontFace: BODY, color: INK, bold: true, margin: 0 });
    s.addText(r[3], { x: 6.8,  y: y + 0.14, w: 5.6, h: 0.5, fontSize: 12.5, fontFace: BODY, color: INK_SOFT, margin: 0, lineSpacing: 16 });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.7, y: y0 + 6 * rh, w: 11.9, h: 0.02, fill: { color: LINE } });
  s.addText('53 Aufgaben mit Namen, Frist und Aufwand liegen in der App. Änderbar — ein Plan, den niemand anfasst, ist keiner.', {
    x: 0.7, y: y0 + 6 * rh + 0.3, w: 11.9, h: 0.35, fontSize: 13, fontFace: BODY, color: INK_FAINT, italic: true, margin: 0
  });
  s.addNotes('Nicht Zeile für Zeile vorlesen. Nur zwei Dinge betonen: in Phase 0 und 1 wird kein Geld ausgegeben, und in Phase 4 wird nicht nachgekauft, egal wie gut es läuft.');
}

/* ================================================= 11 — Gate-Regel ======= */
{
  const s = light('Die Bremse', 'Die Abbruchregel legen wir heute fest');
  lead(s, 'Im Januar ist jede Zahl verhandelbar, wenn man sie erst dann bewertet. Deshalb steht die Regel vorher — dann ist sie im Januar noch etwas wert.');

  const cols = [
    { c: GO,   k: 'ab 9 von 30 verkauft', h: 'Weiter', b: 'Charge 2 mit doppelter Menge und den gleichen Kriterien. Der Kurs stimmt.' },
    { c: HOLD, k: '5 bis 8 verkauft',     h: 'Korrigieren', b: 'Kein Nachkauf. Erst Kanal und Preis anpassen, Restbestand abverkaufen, dann neu messen.' },
    { c: STOP, k: 'unter 5 verkauft',     h: 'Stopp', b: 'Der Einkauf war falsch. Restbestand abverkaufen und entweder Kriterien komplett neu — oder wir lassen es.' }
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 4.05;
    panel(s, { x, y: 2.95, w: 3.75, h: 2.6, kicker: c.k, kickerColor: c.c, head: c.h, headSize: 27, headH: 0.55, headColor: c.c, body: c.b });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 5.85, w: 11.9, h: 0.9, fill: { color: 'F1EDE6' } });
  s.addText('Und unabhängig davon: liegt der Stundenlohn unter CHF 25, schlägt das Projekt keinen Nebenjob. Auch das gehört im Januar ausgesprochen.', {
    x: 1.05, y: 6.05, w: 11.2, h: 0.5, fontSize: 14, fontFace: BODY, color: INK, margin: 0
  });
  s.addNotes('Zustimmung hier aktiv einholen. Wenn beide die Regel heute mittragen, wird die Januarsitzung eine Ablesung statt einer Diskussion.');
}

/* ================================ 12 — Vier Dinge vor dem ersten Franken = */
{
  const s = light('Bevor Geld fliesst', 'Vier Dinge, die geklärt sein müssen');

  const items = [
    { h: 'Rechtsform', b: 'Ohne schriftlichen Vertrag sind wir eine einfache Gesellschaft nach Art. 530 ff. OR: unbeschränkte, solidarische Haftung mit dem Privatvermögen. Jeder haftet für alles — auch für das, was die anderen entscheiden.' },
    { h: 'Uhrenvertrag', b: 'Provision, Echtheitsgarantie mit Rückgriff, Versicherung während der Lagerung, und die Frage, wer bei Zahlungsausfall haftet. Bei Stückpreisen über CHF 2\'000 einmal 60 Minuten Rechtsberatung, CHF 300 bis 500.' },
    { h: 'RAV', b: 'Jans selbständige Nebentätigkeit ist meldepflichtig. Das Gespräch gehört vor die Anmeldung und vor das erste Inserat — nicht danach.' },
    { h: 'Echtheit', b: 'Im Designer-Segment ist die Authentifizierung das eigentliche Geschäft. Prüfprotokoll mit sieben Punkten je Artikel, klare Formulierung im Shop, und eine namentlich benannte Person, die freigibt.' }
  ];
  items.forEach((it, i) => {
    const x = 0.7 + (i % 2) * 6.05;
    const y = 2.0 + Math.floor(i / 2) * 2.5;
    panel(s, { x, y, w: 5.85, h: 2.3, head: it.h, headSize: 22, headH: 0.45, body: it.b, bodySize: 13 });
  });
  s.addNotes('Das ist die unbequeme Folie. Kurz halten, aber die Solidarhaftung ausdrücklich sagen: Wenn ich einen Fehler mache, haftet ihr mit eurem Privatvermögen. Deshalb der Vertrag, und deshalb bei den Uhren Vorsicht.');
}

/* ============================================ 13 — Risiko Uhren ========== */
{
  const s = light('Das grösste Risiko', 'Bei den Uhren entscheidet eine Frage');
  lead(s, 'Wer stellt die Rechnung an den Kunden? Entscheidend ist der Auftritt nach aussen, nicht die Bezeichnung im Vertrag: eigener Checkout und eigene Rechnung machen uns zum Verkäufer, egal was auf dem Papier steht.');

  panel(s, { x: 0.7, y: 3.0, w: 5.85, h: 2.55, kicker: 'Empfehlung für den Start', kickerColor: GO,
    head: 'Vermittlung', headSize: 26, headH: 0.5, headColor: GO,
    body: 'Der Händler ist Verkäufer und haftet. Wir vermitteln und kassieren Provision. Kostet Konversion — der Kunde wechselt zu seinem Checkout — und spart die Haftung.' });
  panel(s, { x: 6.75, y: 3.0, w: 5.85, h: 2.55, kicker: 'Später, wenn die Struktur trägt', kickerColor: STOP,
    head: 'Kommission', headSize: 26, headH: 0.5,
    body: 'Wir verkaufen in eigenem Namen nach Art. 425 ff. OR und haften gegenüber dem Kunden für Echtheit und Mängel. Bessere Marge, volles Risiko.' });

  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 5.85, w: 11.9, h: 0.95, fill: { color: 'F7E5E0' } });
  s.addText('Bei CHF 2\'700 Eigenkapital und Haftung mit dem Privatvermögen kann ein einziger strittiger Uhrenverkauf mehr kosten, als das ganze Projekt je einbringt.', {
    x: 1.05, y: 6.05, w: 11.2, h: 0.55, fontSize: 14.5, fontFace: BODY, color: '6B2418', margin: 0
  });
  s.addNotes('Luan führt das Gespräch mit dem Händler. Die eine Frage, die er mitnimmt: Wer steht auf der Rechnung? Alles andere im Vertrag ist Detail.');
}

/* ================================================ 14 — Bänder ============ */
{
  const s = light('Der Ausblick', 'Bänder: die Mindestmenge entscheidet');
  lead(s, 'Eigene Marke, extern produziert, vier Artikel zum Start. Klingt nach dem kleinsten Strang und ist finanziell der grösste.');

  stat(s, { x: 0.7,  y: 2.85, w: 3.85, h: 2.0, label: 'Bei MOQ 100 und 4 Artikeln', value: 'CHF 4\'800', sub: '400 Stück Lager zu EK CHF 12', color: STOP });
  stat(s, { x: 4.72, y: 2.85, w: 3.85, h: 2.0, label: 'Zum Vergleich: Kleider-Charge', value: 'CHF 2\'700', sub: 'unser gesamtes Startkapital' });
  stat(s, { x: 8.75, y: 2.85, w: 3.85, h: 2.0, label: 'Vorlauf bis zur Ware', value: '4 – 6 Monate', sub: 'Recherche ab November, Ware im Frühjahr' });

  panel(s, { x: 0.7, y: 5.15, w: 5.85, h: 1.75, head: 'Markenschutz beim IGE', headSize: 21, headH: 0.42,
    body: 'CHF 450 für 10 Jahre und drei Klassen, minus CHF 100 bei elektronischer Anmeldung — also CHF 350. Vorabrecherche kostenlos über swissreg.ch.' });
  panel(s, { x: 6.75, y: 5.15, w: 5.85, h: 1.75, head: 'Die Regel', headSize: 21, headH: 0.42,
    body: 'Bänder erst, wenn die Kleider-Charge Geld zurückgespült hat — oder mit einem Hersteller, dessen Mindestmenge bei 30 liegt.' });
  s.addNotes('Nur kurz. Der Punkt ist, dass Bänder nicht das kleine Nebenprojekt sind, für das man sie hält. Entscheiden wir erst nach dem Gate.');
}

/* ============================================== 15 — Das Werkzeug ======== */
{
  const s = light('Das Werkzeug', 'Wir arbeiten alle im gleichen Stand');
  lead(s, 'Fahrplan, Aufgaben, Artikel-Log, Zahlen und der Kaufentscheid fürs Ladengeschäft. Läuft am Rechner und als App auf dem Homescreen, auch offline.');

  s.addImage({ path: path.join(DIR, 'app-cockpit-desktop.png'), x: 0.7, y: 2.7, w: 6.2, h: 4.17 });
  s.addImage({ path: path.join(DIR, 'app-buy-mobile.png'),      x: 7.1, y: 2.7, w: 1.42, h: 2.84 });

  s.addText('Kaufentscheid', { x: 8.85, y: 2.7, w: 3.75, h: 0.35, fontSize: 15, fontFace: BODY, color: INK, bold: true, margin: 0 });
  s.addText('Elf harte Kriterien plus Preisprüfung. Im Laden auszufüllen, bevor Geld fliesst — die Ampel sagt kaufen oder liegen lassen.', {
    x: 8.85, y: 3.07, w: 3.75, h: 1.1, fontSize: 12.5, fontFace: BODY, color: INK_SOFT, margin: 0, lineSpacing: 17
  });
  s.addText('Artikel-Log', { x: 8.85, y: 4.25, w: 3.75, h: 0.35, fontSize: 15, fontFace: BODY, color: INK, bold: true, margin: 0 });
  s.addText('Einkaufspreis, Bearbeitungsminuten, Einstelldatum, Verkauf. Daraus entsteht die einzige Zahl, die im Januar zählt.', {
    x: 8.85, y: 4.62, w: 3.75, h: 1.1, fontSize: 12.5, fontFace: BODY, color: INK_SOFT, margin: 0, lineSpacing: 17
  });
  s.addText('Stundenkonto', { x: 8.85, y: 5.8, w: 3.75, h: 0.35, fontSize: 15, fontFace: BODY, color: INK, bold: true, margin: 0 });
  s.addText('Damit «gerecht verteilt» eine Zahl ist und kein Gefühl.', {
    x: 8.85, y: 6.17, w: 3.75, h: 0.7, fontSize: 12.5, fontFace: BODY, color: INK_SOFT, margin: 0, lineSpacing: 17
  });
  s.addNotes('Link zeigen und beide einladen, es einmal zu öffnen. Wichtig: Daten liegen lokal auf dem Gerät, Austausch über die Backup-Datei — nicht gleichzeitig an denselben Zahlen arbeiten.');
}

/* ======================================== 16 — Was ich brauche =========== */
{
  const s = dark('Der Abschluss', 'Drei Zusagen, dann fangen wir an');

  const asks = [
    { n: 'Beide', h: 'Einlage von CHF 900', d: 'bis Sonntag, 16. August', b: 'Auf ein gemeinsames Konto, nicht auf ein Privatkonto. Jede Einzahlung mit Datum im Vertrag.' },
    { n: 'Beide', h: 'Gesellschaftsvertrag unterschreiben', d: 'bis Freitag, 28. August', b: 'Entwurf kommt bis 21. August. Wir gehen ihn zu dritt Punkt für Punkt durch.' },
    { n: 'Luan', h: 'Gespräch mit dem Uhrenhändler', d: 'bis Montag, 24. August', b: 'Eine Frage mitnehmen: Wer stellt die Rechnung an den Kunden?' }
  ];
  asks.forEach((a, i) => {
    const y = 2.35 + i * 1.42;
    s.addShape(pres.ShapeType.rect, Object.assign({ x: 0.7, y, w: 11.9, h: 1.22 }, cardDark()));
    s.addText(a.n.toUpperCase(), { x: 1.05, y: y + 0.22, w: 1.3, h: 0.28, fontSize: 10, fontFace: BODY, color: SAND, charSpacing: 2, margin: 0 });
    s.addText(a.h, { x: 1.05, y: y + 0.5, w: 7.2, h: 0.42, fontSize: 20, fontFace: DISPLAY, color: ON_DARK, margin: 0 });
    s.addText(a.b, { x: 1.05, y: y + 0.92, w: 8.6, h: 0.28, fontSize: 12, fontFace: BODY, color: ON_DARK_SOFT, margin: 0 });
    s.addText(a.d, { x: 9.4, y: y + 0.48, w: 2.85, h: 0.4, fontSize: 14, fontFace: BODY, color: ON_DARK, bold: true, align: 'right', margin: 0 });
  });

  s.addText('Und für mich: das RAV-Gespräch. Das steht ganz oben, weil davon abhängt, wie viel Zeit ich überhaupt einbringen kann.', {
    x: 0.7, y: 6.75, w: 11.9, h: 0.4, fontSize: 13.5, fontFace: BODY, color: ON_DARK_SOFT, italic: true, margin: 0
  });
  arch(s, 12.0, 0.62, 0.42, SAND);
  s.addNotes('Nicht mit einer Frage enden, sondern mit den drei Zusagen und den Daten. Wenn heute jemand zögert, lieber jetzt klären als im Oktober.');
}

pres.writeFile({ fileName: path.join(DIR, 'Vintage-Mission-Praesentation.pptx') })
  .then(f => console.log('geschrieben:', f));
