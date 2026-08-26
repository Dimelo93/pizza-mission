/* =========================================================================
   VINTAGE MISSION — Startdaten
   Alles hier drin ist Vorschlag, kein Gesetz. Aufgaben, Fristen und
   Verantwortliche lassen sich in der App ändern; diese Datei ist nur der
   Zustand beim ersten Start.
   ========================================================================= */

var SEED = {};

/* ---------------------------------------------------------------- Team ---- */
SEED.team = [
  { id:'jan', name:'Jan',       role:'Motor — Einkauf, Fotografie, Shop-Inhalte, Zahlen, RAV', hours:15 },
  { id:'p2',  name:'Luan',      role:'Handel — Uhrenhändler, Verhandlung, Preise, Buchhaltung', hours:5 },
  { id:'p3',  name:'Mattia',    role:'Prüfer — Echtheit, Vergleichspreise, Texte, Zweitmeinung', hours:3 }
];

/* ------------------------------------------------------------- Annahmen ---- */
SEED.settings = {
  vk:280,            // Ø Verkaufspreis
  ek:90,             // Ø Einkaufspreis
  kvar:20,           // variable Kosten je verkauftem Stück (Versand, Verpackung, Zahlung)
  quote:50,          // erwartete Durchverkaufsquote in %
  minuten:75,        // Arbeitszeit je beschafftem Stück
  satz:25,           // interner Stundensatz CHF für die Vorwegvergütung
  stueck:30,         // Grösse der Testcharge
  kapitalKopf:900,   // Einlage je Person
  ekMin:80,          // Preisuntergrenze Einkauf
  start:'2026-08-10',
  launch:'2026-09-28',
  gate:'2027-01-04',
  theme:'auto'
};

/* ------------------------------------------------------------- Phasen ------ */
SEED.phases = [
  { id:'f0', nr:'Phase 0', name:'Fundament', von:'2026-08-10', bis:'2026-08-16',
    ziel:'Nichts kaufen. Erst klären, was euch sonst später einholt.',
    punkte:['RAV-Gespräch vor jeder Anmeldung','Einkaufskriterien schriftlich','Rollen und Zeitbudget realistisch verteilt','Domain und Instagram-Handle gesichert'] },
  { id:'f1', nr:'Phase 1', name:'Verträge und Struktur', von:'2026-08-17', bis:'2026-08-30',
    ziel:'Die Haftung sortieren, solange sie noch nichts kostet.',
    punkte:['Gesellschaftsvertrag unterschrieben','Uhrenmodell entschieden: Vermittlung oder Kommission','Konto, Buchhaltung, Belegablage','Echtheitsprotokoll und benannter Freigeber'] },
  { id:'f2', nr:'Phase 2', name:'Ware und Shop', von:'2026-08-31', bis:'2026-09-27',
    ziel:'30 Stück beschaffen, aufbereiten, fotografieren. Parallel entsteht die Website.',
    punkte:['3 Beschaffungsrunden à 10 Stück','Jedes Stück mit belegtem Vergleichspreis','Fotoset steht und bleibt gleich','Rechtstexte und Stripe-Konto bereit'] },
  { id:'f3', nr:'Phase 3', name:'Launch', von:'2026-09-28', bis:'2026-10-04',
    ziel:'Tag 0 der Messung. 20 Stück im eigenen Shop, 10 als Kontrollgruppe auf Ricardo.',
    punkte:['Alle 30 Stück gelistet','Ende-zu-Ende-Testbestellung erfolgreich','Startwerte festgehalten'] },
  { id:'f4', nr:'Phase 4', name:'Verkaufen und messen', von:'2026-10-05', bis:'2026-12-27',
    ziel:'90 Tage Daten sammeln. Kein Nachkauf in dieser Zeit.',
    punkte:['Montags 20 Minuten Zahlen-Check','Zwischenstände an Tag 30 und Tag 60','Uhren-Track startet','Bänder-Recherche startet'] },
  { id:'f5', nr:'Phase 5', name:'Gate', von:'2027-01-04', bis:'2027-01-04',
    ziel:'Entscheiden nach der Regel, die vorher festgelegt wurde. Nicht nach Gefühl.',
    punkte:['Zahlen auf den Tisch','Entscheid schriftlich im Log','Charge 2, Korrektur oder Stopp'] }
];

/* ------------------------------------------------------------ Aufgaben ----- */
/* est = Minuten, w = Verantwortlich */
SEED.tasks = [
  /* --- Phase 0 --- */
  { p:'f0', w:'jan', due:'2026-08-11', est:15,  t:'RAV: Termin bei Philipp vereinbaren',
    d:'Zwei Fragen mitnehmen. Erstens: selbständige Nebentätigkeit als Zwischenverdienst anmelden. Zweitens: Förderung der selbständigen Erwerbstätigkeit nach Art. 71a AVIG — bis zu 90 Taggelder in der Planungsphase, in dieser Zeit befreit von Arbeitsbemühungen und Kontrollvorschriften. Das ist der grösste einzelne Hebel im ganzen Plan. Vor jeder Anmeldung klären, nicht danach.' },
  { p:'f0', w:'jan', due:'2026-08-14', est:90,  t:'RAV-Gespräch führen und Ergebnis schriftlich festhalten',
    d:'Antworten notieren und ins Entscheid-Log eintragen. Wenn die Förderung in Frage kommt, verlangt das RAV ein Geschäftskonzept mit Budget — genau das liegt hier in der App.' },
  { p:'f0', w:'jan', due:'2026-08-12', est:60,  t:'Rollen und Zeitbudget zu dritt festlegen',
    d:'Ungleiche Zeit ist kein Problem, ungeklärte Erwartung schon. Wer wie viel, und was passiert, wenn jemand ausfällt.' },
  { p:'f0', w:'jan', due:'2026-08-13', est:90,  t:'Einkaufskriterien schriftlich fixieren',
    d:'Acht harte Punkte plus Preisuntergrenze CHF 80. Der Vorschlag steht unter Einkauf. Was die Kriterien nicht erfüllt, wird nicht gekauft — auch nicht "ausnahmsweise, weil so schön".' },
  { p:'f0', w:'p3',  due:'2026-08-16', est:120, t:'Markenliste erstellen: 25 Marken, die ihr kauft',
    d:'Positivliste. Alles ausserhalb der Liste ist ein Nein, egal wie günstig. Ohne Liste kauft man am Ende Zeug.' },
  { p:'f0', w:'jan', due:'2026-08-12', est:30,  t:'Domain sichern, zwei Kandidaten',
    d:'.ch registrieren, rund CHF 12–15 pro Jahr. Kurz, aussprechbar am Telefon, ohne Bindestrich.' },
  { p:'f0', w:'jan', due:'2026-08-12', est:30,  t:'Instagram-Handle sichern und Konto anlegen',
    d:'Gleicher Name wie die Domain. Ab Woche 1 posten, nicht erst zum Launch — Reichweite braucht Vorlauf.' },
  { p:'f0', w:'jan', due:'2026-08-12', est:45,  t:'Shop-Namen entscheiden',
    d:'Der Shop-Name ist nicht die Bänder-Marke. Zwei getrennte Entscheide, sonst blockiert ihr euch später beim Markenschutz.' },
  { p:'f0', w:'jan', due:'2026-08-14', est:30,  t:'Gemeinsame Ablage für Fotos, Belege, Verträge',
    d:'Ein Ort, drei Zugänge. Fotos in Originalgrösse behalten.' },
  { p:'f0', w:'p2',  due:'2026-08-16', est:45,  t:'Startkapital einzahlen: 3 × CHF 900',
    d:'Ein gemeinsames Konto, nicht das Privatkonto von einem. Jede Einzahlung mit Datum im Vertrag festhalten.' },

  /* --- Phase 1 --- */
  { p:'f1', w:'jan', due:'2026-08-21', est:180, t:'Gesellschaftsvertrag: Entwurf schreiben',
    d:'Die Klauselliste steht unter Recht. Ohne Vertrag seid ihr eine einfache Gesellschaft nach Art. 530 ff. OR mit unbeschränkter Solidarhaftung — das ändert der Vertrag nicht, aber er regelt alles andere.' },
  { p:'f1', w:'jan', due:'2026-08-26', est:90,  t:'Gesellschaftsvertrag zu dritt durchgehen',
    d:'Jeder Punkt laut vorlesen. Was niemand laut sagen mag, ist genau der Punkt, der später streitet.' },
  { p:'f1', w:'jan', due:'2026-08-28', est:30,  t:'Gesellschaftsvertrag unterschreiben, drei Exemplare',
    d:'Je ein unterschriebenes Original pro Person.' },
  { p:'f1', w:'jan', due:'2026-08-26', est:45,  t:'Stundensatz und Gewinnverteilung festlegen',
    d:'Vorschlag: erfasste Arbeitsstunden werden mit CHF 25 als Vorwegvergütung aus dem Gewinn abgegolten, der Rest zu je einem Drittel. Fällt kein Gewinn an, fällt auch die Vergütung aus — keine Lohnschuld. So bleibt ungleiche Zeit fair, ohne dass jemand Liquidität schuldet.' },
  { p:'f1', w:'p2',  due:'2026-08-24', est:90,  t:'Uhren: Gespräch mit dem Händlerkollegen',
    d:'Die eine Frage, die alles entscheidet: Wer stellt die Rechnung an den Kunden? Steht ihr drauf, haftet ihr für Echtheit und Mängel. Steht er drauf, haftet er und ihr kassiert Provision.' },
  { p:'f1', w:'p2',  due:'2026-08-30', est:150, t:'Uhren: Vertragsentwurf',
    d:'Muss drin sein: Provisionssatz, wer rechnet ab, Echtheitsgarantie mit Rückgriff auf ihn, Versicherung während der Lagerung, Delcredere (haftet ihr für den Zahlungsausfall des Kunden?), Rückgaberegel, Kündigung.' },
  { p:'f1', w:'p2',  due:'2026-08-28', est:30,  t:'Rechtsberatung buchen, falls Uhren über CHF 2\'000',
    d:'60 Minuten, Budget CHF 300–500. Bei einem einzigen strittigen Uhrenverkauf ist das der billigste Posten im Projekt.' },
  { p:'f1', w:'p2',  due:'2026-08-27', est:90,  t:'Buchhaltung aufsetzen',
    d:'Für den Start reicht eine Tabelle: Datum, Beleg-Nr., Text, Betrag, Kategorie, Person. Wichtig ist die Belegablage, nicht das Tool.' },
  { p:'f1', w:'jan', due:'2026-08-27', est:45,  t:'Versicherung prüfen: Ware im Privathaushalt',
    d:'Handelsware ist in der Hausratversicherung meist nicht gedeckt. Bei CHF 2\'700 Warenwert einmal nachfragen, bevor der Keller voll ist.' },
  { p:'f1', w:'p3',  due:'2026-08-30', est:90,  t:'Echtheitsprotokoll festlegen und Freigeber benennen',
    d:'Sieben Prüfpunkte, eine Person unterschreibt die Freigabe namentlich. Das Protokoll steht unter Recht.' },

  /* --- Phase 2 --- */
  { p:'f2', w:'jan', due:'2026-09-03', est:120, t:'Fotoset aufbauen',
    d:'Ein Hintergrund, eine Lichtsituation, eine feste Kameraposition. Immer gleich. Gleichförmigkeit lässt einen Shop teuer aussehen, Perfektion einzelner Bilder nicht.' },
  { p:'f2', w:'jan', due:'2026-09-03', est:45,  t:'Bildstil festlegen: 5 Pflichtbilder pro Stück',
    d:'Ganzansicht, Label, Verarbeitungsdetail (Naht oder Verschluss), jeder Makel einzeln, Trage- oder Hängebild. Der Makel gehört sichtbar auf die Produktseite — das senkt Retouren stärker als jede Formulierung.' },
  { p:'f2', w:'jan', due:'2026-09-06', est:300, t:'Beschaffungsrunde 1: 10 Stück',
    d:'Jedes Stück durch den Kaufentscheid in dieser App laufen lassen, bevor Geld fliesst. Auch wenn es an der Kasse zwei Minuten dauert.' },
  { p:'f2', w:'p2',  due:'2026-09-13', est:300, t:'Beschaffungsrunde 2: 10 Stück' },
  { p:'f2', w:'jan', due:'2026-09-20', est:300, t:'Beschaffungsrunde 3: 10 Stück' },
  { p:'f2', w:'jan', due:'2026-09-24', est:900, t:'Aufbereitung und Fotografie, je Stück ≤ 45 Minuten',
    d:'Zeit pro Stück ehrlich mitschreiben. Diese Zahl entscheidet später über den Stundenlohn, nicht der Verkaufspreis.' },
  { p:'f2', w:'p3',  due:'2026-09-24', est:300, t:'Vergleichspreise belegen, zwei je Stück',
    d:'Zwei tatsächlich verkaufte Referenzen aus den letzten 90 Tagen. Angebotspreise zählen nicht — die stehen teilweise seit zwei Jahren drin.' },
  { p:'f2', w:'p3',  due:'2026-09-26', est:300, t:'Produkttexte schreiben',
    d:'60 bis 90 Wörter. Massangaben flach gemessen in cm, Material, Zustand ehrlich mit benanntem Makel, ein Satz zur Herkunft oder Epoche.' },
  { p:'f2', w:'jan', due:'2026-09-14', est:120, t:'Shop-Seite: Inhalte zusammenstellen',
    d:'Logo oder Wortmarke, zwei Farbwerte, Über-uns-Text, Versand- und Rückgabetext, Kontaktangaben. Damit wird die Website gebaut.' },
  { p:'f2', w:'jan', due:'2026-09-18', est:180, t:'Rechtstexte für den Shop',
    d:'Impressum, AGB, Datenschutzerklärung nach revDSG, Rückgabepolitik. Achtung Gewährleistung: bei Gebrauchtware an Konsumenten sind mindestens 12 Monate zwingend (Art. 210 OR), kürzer geht nicht.' },
  { p:'f2', w:'p2',  due:'2026-09-16', est:60,  t:'Stripe-Konto eröffnen, TWINT und Karte aktivieren',
    d:'Gebühren Schweiz: TWINT 1.9 % + CHF 0.30, Schweizer Karten 2.9 % + CHF 0.30. Keine Grund- oder Kontoführungsgebühr.' },
  { p:'f2', w:'p2',  due:'2026-09-20', est:90,  t:'Versandprozess festlegen',
    d:'Verpackung, Postprodukt, Preis für den Kunden, Laufzeit, Sendungsverfolgung. Einmal echt durchspielen und die Zeit messen.' },
  { p:'f2', w:'jan', due:'2026-09-21', est:240, t:'Instagram: 12 Beiträge vorproduzieren',
    d:'Ab Woche 4 dreimal wöchentlich. Zum Launch braucht ihr Publikum, nicht erst dann Publikum aufbauen.' },
  { p:'f2', w:'jan', due:'2026-09-21', est:60,  t:'Kontrollgruppe vorbereiten: Ricardo-Konto und die 10 Stück auswählen',
    d:'Entschieden am 10.08.2026. Die 10 Stück quer durch Marken, Kategorien und Preislagen ziehen, nicht die Ladenhüter aussortieren — sonst vergleicht ihr am Ende zwei verschiedene Sortimente. Preise identisch zum Shop.' },
  { p:'f2', w:'p3',  due:'2026-09-27', est:45,  t:'Testbestellung durch eine externe Person',
    d:'Jemand von aussen bestellt, zahlt und erhält ein Stück. Alles, was dabei hakt, hakt später bei jedem Kunden.' },

  /* --- Phase 3 --- */
  { p:'f3', w:'jan', due:'2026-09-29', est:240, t:'20 Stück im eigenen Shop einstellen' },
  { p:'f3', w:'jan', due:'2026-09-30', est:150, t:'10 Stück auf Ricardo einstellen',
    d:'Gleiche Preise wie im Shop. Sonst vergleicht ihr am Ende zwei verschiedene Experimente.' },
  { p:'f3', w:'jan', due:'2026-10-01', est:90,  t:'Launch-Beitrag und Story-Serie' },
  { p:'f3', w:'jan', due:'2026-10-02', est:90,  t:'30 persönliche Nachrichten an Bekannte',
    d:'Zu dritt je zehn. Keine Sammelnachricht, keine Story — einzeln geschrieben. Die ersten Verkäufe kommen fast nie über Reichweite.' },
  { p:'f3', w:'jan', due:'2026-10-04', est:15,  t:'Startwerte festhalten: 30 Stück, CHF 2\'700 gebunden',
    d:'Tag 0 der 90-Tage-Messung.' },

  /* --- Phase 4 --- */
  { p:'f4', w:'jan', due:'2026-10-12', est:20,  t:'Zahlen-Check Woche 2' },
  { p:'f4', w:'jan', due:'2026-10-19', est:20,  t:'Zahlen-Check Woche 3' },
  { p:'f4', w:'jan', due:'2026-10-28', est:60,  t:'Zwischenstand Tag 30',
    d:'Verkaufte Stück, Median-Liegedauer, welche Stücke Anfragen erzeugt haben und welche gar nichts. Bei unter 3 Verkäufen liegt das Problem beim Kanal, nicht beim Preis.' },
  { p:'f4', w:'jan', due:'2026-10-30', est:60,  t:'Preiskorrektur: alles ohne Anfrage nach 30 Tagen minus 15 %',
    d:'Regel im Voraus festlegen und dann stur anwenden. Wer im Einzelfall diskutiert, diskutiert bei jedem Stück.' },
  { p:'f4', w:'p3',  due:'2026-11-06', est:90,  t:'Bänder: Swissreg-Recherche für 3 Namenskandidaten',
    d:'Kostenlose Recherche unter swissreg.ch. Identische und ähnliche Marken in den relevanten Klassen prüfen, bevor irgendwo ein Name gedruckt wird.' },
  { p:'f4', w:'p2',  due:'2026-11-09', est:120, t:'Uhren: Vertrag unterschrieben, 3 Stück testweise gelistet',
    d:'Klein anfangen. Drei Uhren zeigen, ob der Prozess trägt, ohne dass ein Fehler existenzbedrohend wird.' },
  { p:'f4', w:'p2',  due:'2026-11-20', est:180, t:'Bänder: 5 Herstelleranfragen',
    d:'Immer mitfragen: MOQ pro Artikel und pro Farbe, Musterkosten, Vorlaufzeit, Zahlungsbedingungen, Zollposition. Die MOQ entscheidet, ob das Projekt überhaupt geht.' },
  { p:'f4', w:'jan', due:'2026-11-27', est:60,  t:'Zwischenstand Tag 60' },
  { p:'f4', w:'jan', due:'2026-11-27', est:45,  t:'Bänder: Entscheid über Markenanmeldung',
    d:'IGE: CHF 450 für 10 Jahre und 3 Klassen, minus CHF 100 bei elektronischer Anmeldung über eTrademark, also CHF 350. Jede weitere Klasse CHF 100. Verlängerung nach 10 Jahren CHF 550.' },
  { p:'f4', w:'jan', due:'2026-11-30', est:60,  t:'Weihnachtsfenster vorbereiten',
    d:'Versandschluss kommunizieren, Geschenkverpackung anbieten. Dezember ist im Secondhand das stärkste Fenster des Jahres — und es fällt genau in eure Messperiode.' },
  { p:'f4', w:'jan', due:'2026-12-27', est:60,  t:'Restbestand-Regel anwenden: über 90 Tage minus 30 %',
    d:'Kapital, das in unverkäuflicher Ware steckt, ist teurer als der Rabatt.' },

  /* --- Phase 5 --- */
  { p:'f5', w:'jan', due:'2027-01-04', est:120, t:'Gate-Sitzung: Entscheid nach der festgelegten Regel',
    d:'Die Regel steht im Cockpit und wurde im August festgelegt. Genau deshalb ist sie im Januar noch etwas wert.' },
  { p:'f5', w:'jan', due:'2027-01-04', est:20,  t:'Entscheid schriftlich ins Log' }
];

/* ---------------------------------------------------- Einkaufskriterien ---- */
SEED.criteria = [
  { t:'Marke steht auf der Positivliste',
    d:'25 definierte Marken. Nicht drauf heisst nein, unabhängig vom Preis.' },
  { t:'Zustand mindestens sehr gut',
    d:'Keine Löcher, keine Flecken auf Sichtflächen, alle Knöpfe da, Reissverschluss läuft. Reparaturbedarf über 20 Minuten ist ein Nein.' },
  { t:'Grösse im Kernbereich',
    d:'Randgrössen liegen im Schnitt doppelt so lange. Bei Damenoberteilen etwa 36–40, bei Herren M–L.' },
  { t:'Einkaufspreis mindestens CHF 80',
    d:'Unter der Grenze seid ihr im Massenmarkt und konkurriert mit Vinted-Preisen. Das ist nicht euer Segment.' },
  { t:'Realistischer Verkaufspreis mindestens 3 × Einkauf und mindestens CHF 180',
    d:'Bei EK 90 heisst das VK ab 270. Wer die Spanne nicht sieht, kauft nicht.' },
  { t:'Zwei verkaufte Vergleichsstücke aus den letzten 90 Tagen gefunden',
    d:'Verkaufte, nicht angebotene. Kein Beleg, kein Kauf.' },
  { t:'Echtheitsindikatoren vollständig geprüft',
    d:'Label, Naht, Verschluss, Innenfutter. Bei einem einzigen Zweifel: liegen lassen.' },
  { t:'Aufbereitung höchstens 45 Minuten',
    d:'Waschen oder Reinigung, Dämpfen, Fotografieren, Einstellen. Alles darüber frisst den Deckungsbeitrag.' },
  { t:'Saison passt: spätestens 6 Wochen vor Saisonbeginn gekauft',
    d:'Wintermantel im Januar gekauft heisst zehn Monate Kapitalbindung.' },
  { t:'Zweitmeinung eingeholt, wenn Einkauf über CHF 200',
    d:'Foto an eine zweite Person, Antwort innert 24 Stunden. Kein Alleingang bei teuren Stücken.' },
  { t:'Ihr wollt das Stück nicht selbst behalten',
    d:'Der teuerste Fehler im Vintage-Handel. Wer für den eigenen Schrank einkauft, kauft am Markt vorbei.' }
];

/* ------------------------------------------------------ Echtheitsprotokoll - */
SEED.authCheck = [
  { t:'Label: Schriftart, Nähweise, Waschsymbole, Herkunftsangabe' },
  { t:'Innenetikett: Grössen- und Pflegeetikett stimmen mit der Epoche überein' },
  { t:'Nähte: Stichdichte gleichmässig, keine losen Fäden, Futter sauber eingesetzt' },
  { t:'Verschluss: Marke des Reissverschlusses passt zu Haus und Jahrzehnt' },
  { t:'Knöpfe und Beschläge: Material, Gravur, Gewicht' },
  { t:'Haptik und Gewicht des Stoffs plausibel für Material und Preisklasse' },
  { t:'Herkunft dokumentiert: wo gekauft, von wem, Beleg vorhanden' }
];

/* ------------------------------------------------------------- Recht ------- */
SEED.legal = [
  { g:'Rechtsform', t:'Gesellschaftsvertrag aufsetzen und unterschreiben',
    d:'Ohne schriftlichen Vertrag seid ihr automatisch eine einfache Gesellschaft nach Art. 530 ff. OR: unbeschränkte, solidarische Haftung mit dem Privatvermögen. Jeder haftet für alles, auch für das, was die anderen entscheiden. Der Vertrag hebt die Haftung nach aussen nicht auf, regelt aber alles im Innenverhältnis.' },
  { g:'Rechtsform', t:'Klauselliste abarbeiten',
    d:'Einlagen je Person und Datum. Rollen und Zeitbudget. Entscheidungsregeln — was einstimmig, was mit zwei Stimmen, was allein. Gewinn- und Verlustverteilung inklusive Stundensatz. Wem gehört das Lager. Was passiert bei Austritt, Krankheit, längerem Ausfall. Wie wird bewertet, wenn jemand aussteigt. Kündigungsfrist. Was mit Domain, Marke und Instagram-Konto passiert.' },
  { g:'Rechtsform', t:'Handelsregister und Mehrwertsteuer im Blick behalten',
    d:'Beides wird erst ab CHF 100\'000 Jahresumsatz relevant. Bei 30 Stück à CHF 280 seid ihr weit darunter. Notieren, nicht bearbeiten. Wenn es soweit ist: bei Gebrauchtware gibt es die Margenbesteuerung nach Art. 24a MWSTG und den fiktiven Vorsteuerabzug nach Art. 28a MWSTG — beides spart im Secondhand-Handel echtes Geld, aber nur mit sauberer Dokumentation je Stück.' },
  { g:'Uhren', t:'Modell entscheiden: Vermittlung oder Kommission',
    d:'Kommission nach Art. 425 ff. OR heisst, ihr verkauft in eigenem Namen und haftet gegenüber dem Kunden für Echtheit und Mängel. Echte Vermittlung heisst, euer Kollege ist Verkäufer und haftet. Entscheidend ist der Auftritt nach aussen, nicht die Bezeichnung im Vertrag: eigener Checkout und eigene Rechnung machen euch zum Verkäufer, egal was auf dem Papier steht.' },
  { g:'Uhren', t:'Empfehlung für den Start: Vermittlung',
    d:'Bei CHF 2\'700 Eigenkapital ist ein einziger strittiger Uhrenverkauf existenzbedrohend, weil jeder von euch mit dem Privatvermögen haftet. Vermittlung kostet Konversion — der Kunde wechselt zum Checkout des Kollegen — und spart die Haftung. Wechseln könnt ihr, wenn Struktur und Kapital tragen.' },
  { g:'Uhren', t:'Vertragsinhalte mit dem Händlerkollegen',
    d:'Provisionssatz und Fälligkeit. Wer stellt die Rechnung. Echtheitsgarantie mit Rückgriff auf ihn. Versicherung während der Lagerung bei euch. Delcredere: haftet ihr, wenn der Kunde nicht zahlt. Rückgaberegel. Was passiert mit unverkaufter Ware. Kündigungsfrist.' },
  { g:'Uhren', t:'Rechtsberatung bei Stückpreisen über CHF 2\'000',
    d:'Einmal 60 Minuten, CHF 300–500. Verglichen mit dem Haftungsrisiko ist das der günstigste Posten im Projekt.' },
  { g:'RAV', t:'Vor jeder Anmeldung mit Philipp sprechen',
    d:'Eine selbständige Nebentätigkeit ist meldepflichtig. Einkünfte gelten als Zwischenverdienst und müssen der Arbeitslosenkasse selbst deklariert werden. Das Gespräch gehört vor die Firmengründung und vor das erste Inserat.' },
  { g:'RAV', t:'Förderung der selbständigen Erwerbstätigkeit prüfen (Art. 71a AVIG)',
    d:'Die Arbeitslosenversicherung kann während der Planungsphase eines Projekts bis zu 90 Taggelder ausrichten. In dieser Zeit entfallen Arbeitsbemühungen und Kontrollvorschriften. Voraussetzungen: unverschuldet arbeitslos, mindestens 20 Jahre alt, und ein grobes Projekt, das wirtschaftlich tragfähig und dauerhaft ist. Was das für den weiteren Taggeldanspruch bedeutet, muss das RAV im Einzelfall beantworten — deshalb fragen und nicht annehmen.' },
  { g:'Echtheit', t:'Prüfprotokoll je Artikel führen',
    d:'Sieben Punkte, dokumentiert im Artikel-Log. Ohne Protokoll kein Verkauf im oberen Segment.' },
  { g:'Echtheit', t:'Freigeber namentlich benennen',
    d:'Eine Person unterschreibt die Freigabe. Geteilte Verantwortung ist im Zweifel keine.' },
  { g:'Echtheit', t:'Formulierung im Shop festlegen',
    d:'Nicht "100 % authentisch garantiert" — das ist eine Zusicherung, für die ihr geradesteht. Besser: "Jedes Stück wird nach unserem Prüfprotokoll geprüft. Bei begründetem Echtheitszweifel nehmen wir es innert 14 Tagen gegen volle Rückerstattung zurück." Das ist ein Versprechen, das ihr halten könnt.' },
  { g:'Shop', t:'Gewährleistung: mindestens 12 Monate, auch bei Gebrauchtware',
    d:'Nach Art. 210 OR beträgt die Gewährleistungsfrist zwei Jahre. Bei gebrauchten Sachen darf sie auf ein Jahr verkürzt werden — im Verkauf an Konsumenten aber nicht darunter. Eine AGB-Klausel mit "Gewährleistung ausgeschlossen" ist gegenüber Privatkunden unwirksam.' },
  { g:'Shop', t:'Rückgaberecht ist freiwillig — aber schreibt es hin',
    d:'In der Schweiz gibt es im Fernabsatz kein gesetzliches Widerrufsrecht. Was gilt, steht in euren AGB. Ein klar formuliertes 14-Tage-Rückgaberecht kostet ein paar Retouren und verkauft im oberen Segment deutlich besser als gar keines.' },
  { g:'Shop', t:'Impressum und Datenschutzerklärung nach revDSG',
    d:'Firmierung, Adresse, Kontakt, verantwortliche Person. Datenschutzerklärung nach dem revidierten DSG: welche Daten, wozu, wie lange, an wen sie gehen (Stripe, Post, Hosting).' },
  { g:'Shop', t:'Lieferung ins Ausland vorerst ausschliessen',
    d:'Sobald ihr an Konsumenten in der EU verkauft, greift EU-Konsumentenrecht mit 14-tägigem Widerrufsrecht und eigenen Informationspflichten, dazu Zoll und Einfuhrsteuer. Für den 90-Tage-Test: nur Schweiz und Liechtenstein.' },
  { g:'Bänder', t:'Markenrecherche vor jeder Ausgabe',
    d:'Kostenlos über swissreg.ch. Identische und ähnliche Zeichen in den relevanten Klassen prüfen. Ein Name, der schon belegt ist, kostet später die ganze Kollektion.' },
  { g:'Bänder', t:'Markenanmeldung beim IGE',
    d:'CHF 450 für 10 Jahre und drei Klassen, minus CHF 100 bei elektronischer Anmeldung über eTrademark — also CHF 350. Jede weitere Klasse CHF 100. Verlängerung nach 10 Jahren CHF 550.' },
  { g:'Bänder', t:'MOQ vor allem anderen klären',
    d:'Die Mindestbestellmenge entscheidet über das ganze Projekt. Bei MOQ 100 je Artikel und vier Artikeln sind das 400 Stück. Zu EK CHF 12 sind das CHF 4\'800 — fast das Doppelte eurer gesamten Kleider-Testcharge. Sucht Hersteller mit MOQ 30 oder wartet, bis die erste Charge Geld zurückgespült hat.' },
  { g:'Versicherung', t:'Warenlager im Privathaushalt abklären',
    d:'Handelsware ist in der Hausratversicherung in der Regel nicht gedeckt. Ein Anruf, bevor der Keller voll ist.' }
];

/* ------------------------------------------------------- Strategie-Text ---- */
SEED.doc = [
{ h:'Worum es in den ersten 90 Tagen wirklich geht', b:[
  {p:'Die erste Charge verdient kein Geld. Bei 30 Stück, 50 % Durchverkauf und CHF 40 Deckungsbeitrag pro beschafftem Stück sind das CHF 1\'200 in sechs Monaten, verteilt auf drei Köpfe und rund 37 Arbeitsstunden. Rund CHF 400 pro Person. Wer das als Einkommen plant, hört im Februar auf.'},
  {p:'Die Charge ist ein Messinstrument. Sie beantwortet eine einzige Frage: Wie schnell verkauft sich, was ihr einkauft? Diese Zahl kennt ihr heute nicht, und ohne sie ist jede weitere Entscheidung geraten. Ab der zweiten Charge, mit bekannter Quote und geschärften Kriterien, wird es ein Geschäft.'}
]},
{ h:'Die Zahl, an der alles hängt', b:[
  {p:'Der Deckungsbeitrag pro beschafftem Stück rechnet sich so: Verkaufspreis mal Durchverkaufsquote, minus Einkaufspreis, minus variable Kosten mal Quote. Bei VK 280, EK 90, variablen Kosten 20 und 50 % Quote sind das CHF 40. Auf 75 Minuten Arbeit sind das CHF 32 pro Stunde.'},
  {p:'Interessant sind die Schwellen. Unter 34.6 % Durchverkauf verliert ihr Geld, bevor die Arbeitszeit überhaupt gezählt ist. Unter 46.6 % arbeitet ihr gratis, wenn die eigene Stunde mit CHF 25 bewertet wird. Bei 70 % sind es CHF 92 pro Stück und knapp CHF 74 pro Arbeitsstunde.'},
  {p:'Die geplanten 50 % liegen damit gut drei Prozentpunkte über dem Punkt, an dem eure Arbeit gratis ist. Deshalb liegt der Hebel nicht beim Preis, sondern bei der Quote — und die entsteht im Einkauf, nicht im Marketing.'}
]},
{ h:'Das Problem mit dem eigenen Shop', b:[
  {p:'Ihr wollt über eine eigene Website verkaufen, nicht über Marktplätze. Das ist auf Dauer der richtige Weg: eigene Marke, eigene Kunden, keine Plattformgebühr, keine Abhängigkeit. Nur hat eine neue Website am ersten Tag null Besucher. Wenn nach 90 Tagen wenig verkauft ist, wisst ihr nicht, ob der Einkauf schlecht war oder ob schlicht niemand da war. Die Messung wäre wertlos.'},
  {p:'Deshalb der Vorschlag: 20 Stück in den eigenen Shop, 10 als Kontrollgruppe auf Ricardo, gleiche Preise. Ricardo hat die Nachfrage, die ihr noch nicht habt. Nach 90 Tagen vergleicht ihr Liegedauer und erzielten Preis. Verkauft die Kontrollgruppe deutlich besser, ist euer Problem die Reichweite und der Einkauf stimmt. Verkauft sie auch schlecht, liegt es am Einkauf — und die schönste Website hätte daran nichts geändert.'},
  {p:'Der zweite Teil derselben Antwort: Instagram startet in Woche 1, nicht zum Launch. Reichweite braucht Vorlauf, den ihr in Phase 0 bis 2 ohnehin habt.'}
]},
{ h:'Website: was ich baue, was Stripe macht', b:[
  {p:'Die Verkaufsseite baue ich: Gestaltung, Katalog, Produktseiten, Rechtstexte-Gerüst, eigene Domain. Hosting kostet nichts, die Domain rund CHF 15 im Jahr.'},
  {p:'Was ich nicht selbst baue, ist der Checkout. Zahlungsabwicklung, Kartendaten und deren Sicherheit gehören zu Stripe: TWINT 1.9 % plus CHF 0.30, Schweizer Karten 2.9 % plus CHF 0.30, keine Grundgebühr. Alles selbst zu bauen hiesse Monate Arbeit und ein Sicherheitsrisiko, das ihr nicht tragen müsst.'},
  {p:'Was gegenüber Shopify fehlt: automatische Lagerverwaltung, Rabattcodes, Warenkorbabbruch-Mails, Versandlabels. Bei 30 Unikaten braucht ihr davon nichts. Ab etwa 200 Artikeln im Monat wird die Rechnung anders — dann redet ihr über CHF 30 im Monat gegen Stunden eurer Zeit.'},
  {p:'Ein Punkt ist bei Unikaten heikel: Jedes Stück gibt es genau einmal. Zwei Bestellungen desselben Mantels sind eine Rückerstattung und ein verärgerter Kunde. Der Artikel-Status muss deshalb sofort auf verkauft, und die App exportiert den Katalog dafür auf Knopfdruck.'}
]},
{ h:'Ungleiche Zeit, faire Verteilung', b:[
  {p:'Jan hat aktuell am meisten Zeit, einer ist selbständig, einer ist frisch Vater und zu 100 % angestellt. Gleiche Anteile bei ungleicher Arbeit halten genau so lange, bis der Erste rechnet.'},
  {p:'Vorschlag: Jede Person erfasst ihre Stunden. Am Jahresende — oder beim Gate — werden die Stunden mit CHF 25 als Vorwegvergütung aus dem Gewinn abgegolten, der Rest wird zu je einem Drittel geteilt. Ist kein Gewinn da, fällt die Vergütung aus. Es entsteht also nie eine Lohnschuld, die Liquidität frisst.'},
  {p:'Das Kapital bleibt davon unberührt: Jeder legt CHF 900 ein, jeder bekommt CHF 900 zurück, bevor Gewinn verteilt wird. Zwei getrennte Töpfe, zwei getrennte Diskussionen. Für Jan gilt zusätzlich: Vorwegvergütung ist Zwischenverdienst und gehört gemeldet.'}
]},
{ h:'Die Aufgaben passen zu den Leben', b:[
  {p:'Jan trägt alles mit Termindruck: Einkauf, Aufbereitung, Fotografie, Shop-Inhalte, Zahlen, RAV. Rund 15 Stunden pro Woche.'},
  {p:'Der Selbständige übernimmt, was Verhandlung und Verlässlichkeit braucht, aber planbar terminiert werden kann: die Beziehung zum Uhrenhändler, Verträge, Preise, Buchhaltung. Rund 5 Stunden, flexibel gelegt.'},
  {p:'Der frischgebackene Vater bekommt ausschliesslich asynchrone Arbeit ohne Termindruck: Echtheitsrecherche, Vergleichspreise, Produkttexte, Zweitmeinung per Foto bei Einkäufen über CHF 200. Rund 3 Stunden. In den ersten acht Wochen realistischerweise auch mal null — plant es so ein, dann bricht nichts.'}
]},
{ h:'Reihenfolge und warum sie stimmt', b:[
  {p:'Kleider zuerst, weil sie das Geschäft sind, das ihr lernen müsst: Einkauf, Bewertung, Fotografie, Preisgefühl. Alles davon überträgt sich.'},
  {p:'Uhren zweitens, weil sie kein Kapital binden, aber Haftung erzeugen. Erst wenn Vertrag und Auftritt sauber sind, gehen sie live — drei Stück zum Test, nicht dreissig.'},
  {p:'Bänder zuletzt, weil sie das kapitalintensivste Teilprojekt sind. Die Mindestbestellmenge entscheidet alles: Bei MOQ 100 und vier Artikeln liegen CHF 4\'800 im Lager, fast doppelt so viel wie die gesamte Kleider-Charge, mit vier bis sechs Monaten Vorlauf. Startet die Recherche im November, entscheidet nach dem Gate, produziert im Frühjahr.'}
]},
{ h:'Was den Plan kippen kann', b:[
  {p:'Das RAV. Wenn Philipp die selbständige Tätigkeit anders einordnet als erwartet, ändert sich Jans Zeitbudget und damit der ganze Fahrplan. Deshalb steht das Gespräch an Position eins und nicht irgendwo in Woche sechs.'},
  {p:'Die Haftung bei den Uhren. Ein einziger Verkauf einer nicht echten Uhr im eigenen Namen kann bei unbeschränkter Solidarhaftung mehr kosten, als das gesamte Projekt je einbringt. Solange die Vermittlungskonstruktion nicht steht, geht keine Uhr online.'},
  {p:'Der Einkauf. CHF 90 pro Fehlkauf statt CHF 6 im Massenmarkt. Zehn Fehlkäufe sind CHF 900 — eine ganze Einlage. Die Kriterienliste ist deshalb kein Papier, sondern ein Türsteher.'}
]}
];

/* --------------------------------------------------- Entscheide (Start) ---- */
/* Feste ids, damit sie beim Nachladen nicht doppelt angelegt werden. */
SEED.decisions = [
  { id:'d-kanal', date:'2026-08-10', by:'jan',
    title:'Verkauf über die eigene Website, mit Kontrollgruppe auf Ricardo',
    text:'20 der 30 Stück gehen in den eigenen Shop, 10 zu identischen Preisen auf Ricardo.\n\nGrund: Eine neue Website hat am ersten Tag keine Besucher. Ohne Vergleichskanal würde die 90-Tage-Messung die Reichweite messen statt die Einkaufsqualität, und der Test wäre wertlos. Verkauft die Kontrollgruppe deutlich besser, liegt das Problem bei der Reichweite und der Einkauf stimmt. Verkauft sie auch schlecht, war der Einkauf falsch.\n\nVerworfene Alternative: alle 30 Stück nur im eigenen Shop.' },
  { id:'d-rollen', date:'2026-08-10', by:'jan',
    title:'Rollen und Ausgleich bei ungleicher Zeit',
    text:'Jan rund 15 Stunden pro Woche und alles mit Termindruck. Luan rund 5 Stunden, planbar terminiert: Uhrenhändler, Verträge, Preise, Buchhaltung. Mattia rund 3 Stunden, ausschliesslich asynchron ohne Frist, in den ersten Wochen auch mal null.\n\nAusgleich: erfasste Stunden werden mit CHF 25 als Vorwegvergütung aus dem Gewinn abgegolten, der Rest zu je einem Drittel. Fällt kein Gewinn an, fällt die Vergütung aus — es entsteht nie eine Lohnschuld. Die Einlagen von je CHF 900 bleiben davon getrennt und werden vor jeder Gewinnverteilung zurückgezahlt.' }
];
