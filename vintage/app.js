/* =========================================================================
   VINTAGE MISSION — Anwendungslogik
   Vanilla JS, keine Abhängigkeiten. Daten liegen im localStorage des Geräts.
   ========================================================================= */
(function () {
'use strict';

var KEY = 'vintage_mission_v1';
var S = null;              /* Zustand */
var view = 'cockpit';
var filters = { task:'offen', taskWho:'', item:'alle' };
var buy = { checked:{}, ek:'', vk:'' };

/* ------------------------------------------------------------- Helfer ----- */
function $(sel, root){ return (root||document).querySelector(sel); }
function $$(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
function uid(){ return Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4); }
function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function num(v, d){ var n = parseFloat(v); return isFinite(n) ? n : (d||0); }
function chf(v, dec){
  var d = dec==null ? 0 : dec;
  var n = num(v);
  return n.toLocaleString('de-CH', {minimumFractionDigits:d, maximumFractionDigits:d});
}
function pct(v, dec){ return (num(v)*100).toFixed(dec==null?0:dec).replace('.', ',') + ' %'; }
function today(){ var d = new Date(); return iso(d); }
function iso(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function parseISO(s){
  if(!s) return null;
  var p = String(s).split('-');
  if(p.length !== 3) return null;
  var d = new Date(+p[0], +p[1]-1, +p[2]);
  return isNaN(d.getTime()) ? null : d;
}
function dayDiff(a, b){            /* b - a in Tagen */
  var da = parseISO(a), db = parseISO(b);
  if(!da || !db) return null;
  return Math.round((db - da) / 86400000);
}
function fmtDate(s){
  var d = parseISO(s);
  if(!d) return '—';
  return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear();
}
function fmtShort(s){
  var d = parseISO(s);
  if(!d) return '—';
  return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.';
}
function median(arr){
  if(!arr.length) return null;
  var a = arr.slice().sort(function(x,y){ return x-y; });
  var m = Math.floor(a.length/2);
  return a.length % 2 ? a[m] : (a[m-1] + a[m]) / 2;
}
function toast(msg){
  var el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(function(){ el.classList.remove('on'); }, 2200);
}
function personName(id){
  var p = S.team.filter(function(x){ return x.id === id; })[0];
  return p ? p.name : '—';
}
function phaseOf(id){
  return SEED.phases.filter(function(x){ return x.id === id; })[0] || {name:'—', nr:''};
}

/* ------------------------------------------------------------ Zustand ----- */
function fresh(){
  var st = {
    v: 1,
    team: JSON.parse(JSON.stringify(SEED.team)),
    settings: JSON.parse(JSON.stringify(SEED.settings)),
    tasks: SEED.tasks.map(function(t, i){
      return { id:'t'+(i+1), p:t.p, w:t.w, due:t.due, est:t.est, t:t.t, d:t.d||'', done:false, doneAt:'' };
    }),
    legal: SEED.legal.map(function(l, i){ return { id:'l'+(i+1), done:false, note:'' }; }),
    items: [],
    hours: [],
    decisions: []
  };
  return st;
}
function load(){
  try {
    var raw = localStorage.getItem(KEY);
    if(!raw) return fresh();
    var st = JSON.parse(raw);
    if(!st || !st.tasks) return fresh();
    /* Neue Startaufgaben nachziehen, ohne den eigenen Stand zu überschreiben */
    var have = {};
    st.tasks.forEach(function(t){ have[t.t] = true; });
    SEED.tasks.forEach(function(t, i){
      if(!have[t.t]) st.tasks.push({ id:'t'+(i+1)+'x'+uid(), p:t.p, w:t.w, due:t.due, est:t.est, t:t.t, d:t.d||'', done:false, doneAt:'' });
    });
    while(st.legal.length < SEED.legal.length){
      st.legal.push({ id:'l'+(st.legal.length+1), done:false, note:'' });
    }
    st.items = st.items || [];
    st.hours = st.hours || [];
    st.decisions = st.decisions || [];
    Object.keys(SEED.settings).forEach(function(k){
      if(st.settings[k] === undefined) st.settings[k] = SEED.settings[k];
    });
    return st;
  } catch(e){ return fresh(); }
}
var saveTimer = null;
function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function(){
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch(e){ toast('Speichern fehlgeschlagen — Speicher voll?'); }
  }, 120);
}

/* ------------------------------------------------------------ Rechnen ----- */
function model(o){
  var s = S.settings;
  var vk    = o && o.vk    != null ? o.vk    : s.vk;
  var ek    = o && o.ek    != null ? o.ek    : s.ek;
  var kvar  = o && o.kvar  != null ? o.kvar  : s.kvar;
  var q     = (o && o.quote != null ? o.quote : s.quote) / 100;
  var min   = o && o.minuten != null ? o.minuten : s.minuten;
  var satz  = o && o.satz  != null ? o.satz  : s.satz;

  var db = q * vk - ek - q * kvar;
  var std = min / 60;
  var proStunde = std > 0 ? db / std : 0;
  var spanne = vk - kvar;
  var breakEven = spanne > 0 ? ek / spanne : null;                 /* Quote, ab der kein Verlust */
  var gratis = spanne > 0 ? (ek + satz * std) / spanne : null;     /* Quote, ab der die Arbeit bezahlt ist */
  return { vk:vk, ek:ek, kvar:kvar, q:q, minuten:min, satz:satz,
           db:db, proStunde:proStunde, breakEven:breakEven, gratis:gratis, stunden:std };
}

function stats(){
  var it = S.items;
  var sold = it.filter(function(i){ return !!i.soldDate; });
  var online = it.filter(function(i){ return i.listDate && !i.soldDate; });
  var lager = it.filter(function(i){ return !i.listDate && !i.soldDate; });

  var ekTotal = it.reduce(function(a,i){ return a + num(i.ekChf); }, 0);
  var erloes = sold.reduce(function(a,i){ return a + num(i.soldChf) - num(i.feesChf) - num(i.shipChf); }, 0);
  var db = erloes - ekTotal;
  var minuten = it.reduce(function(a,i){ return a + num(i.prepMin); }, 0);
  var loggedMin = S.hours.reduce(function(a,h){ return a + num(h.minutes); }, 0);
  var arbeitStd = (minuten + loggedMin) / 60;

  var liege = sold.map(function(i){ return dayDiff(i.listDate, i.soldDate); })
                  .filter(function(d){ return d != null && d >= 0; });
  var offenTage = online.map(function(i){ return dayDiff(i.listDate, today()); })
                        .filter(function(d){ return d != null && d >= 0; });

  return {
    n: it.length, sold: sold.length, online: online.length, lager: lager.length,
    quote: it.length ? sold.length / it.length : 0,
    ekTotal: ekTotal, gebunden: it.filter(function(i){ return !i.soldDate; })
                                  .reduce(function(a,i){ return a + num(i.ekChf); }, 0),
    erloes: erloes, db: db,
    dbProStueck: it.length ? db / it.length : 0,
    arbeitStd: arbeitStd,
    proStunde: arbeitStd > 0 ? db / arbeitStd : 0,
    medianLiege: median(liege),
    maxOffen: offenTage.length ? Math.max.apply(null, offenTage) : null,
    ueber90: online.filter(function(i){ var d = dayDiff(i.listDate, today()); return d != null && d > 90; }).length
  };
}

function gateAmpel(){
  var st = stats();
  /* Solange die Charge noch nicht vollständig ist, bleibt die geplante
     Losgrösse die Bezugsgrösse — sonst ergäben zwei Artikel absurde Schwellen. */
  var base = Math.max(st.n, S.settings.stueck);
  var go = Math.ceil(base * 0.30);
  var hold = Math.ceil(base / 6);
  var vorLaunch = today() < S.settings.launch;
  var level = (!st.n || vorLaunch) ? 'idle'
            : (st.sold >= go ? 'go' : (st.sold >= hold ? 'hold' : 'stop'));
  return { level:level, go:go, hold:hold, sold:st.sold, base:base, vorLaunch:vorLaunch };
}

function taskStats(){
  var t = S.tasks;
  var done = t.filter(function(x){ return x.done; }).length;
  var over = t.filter(function(x){ return !x.done && x.due && x.due < today(); }).length;
  return { n:t.length, done:done, offen:t.length-done, over:over,
           pct: t.length ? done/t.length : 0 };
}

/* ------------------------------------------------------------ Rendern ---- */
function render(){
  $$('.view').forEach(function(v){ v.classList.toggle('on', v.id === 'v-' + view); });
  $$('.tabbar button, .sidenav button').forEach(function(b){
    b.classList.toggle('on', b.dataset.go === view || (b.dataset.group||'').split(',').indexOf(view) > -1);
  });
  var fn = ({
    cockpit: renderCockpit, plan: renderPlan, tasks: renderTasks, items: renderItems,
    numbers: renderNumbers, buy: renderBuy, hours: renderHours, decisions: renderDecisions,
    legal: renderLegal, doc: renderDoc, settings: renderSettings, more: renderMore
  })[view];
  if(fn) fn();
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------ Cockpit ---- */
function renderCockpit(){
  var st = stats(), ts = taskStats(), g = gateAmpel(), m = model();
  var tageBisGate = dayDiff(today(), S.settings.gate);
  var tageSeitLaunch = dayDiff(S.settings.launch, today());

  var kpis = [
    { l:'Durchverkauf', v: st.n ? pct(st.quote) : '—',
      s: st.n ? st.sold + ' von ' + st.n + ' Stück' : 'noch keine Artikel erfasst',
      c: st.n ? g.level : '' },
    { l:'DB je Stück', v: st.n ? 'CHF ' + chf(st.dbProStueck) : 'CHF ' + chf(m.db),
      s: st.n ? 'tatsächlich' : 'geplant bei ' + pct(m.q),
      c: st.n ? (st.dbProStueck >= m.db ? 'go' : (st.dbProStueck > 0 ? 'hold' : 'stop')) : '' },
    { l:'Pro Arbeitsstunde', v: 'CHF ' + chf(st.arbeitStd > 0 ? st.proStunde : m.proStunde),
      s: st.arbeitStd > 0 ? chf(st.arbeitStd,1) + ' h erfasst' : 'geplant',
      c: (st.arbeitStd > 0 ? st.proStunde : m.proStunde) >= S.settings.satz ? 'go' : 'hold' },
    { l:'Kapital gebunden', v: 'CHF ' + chf(st.gebunden),
      s: 'von CHF ' + chf(S.settings.kapitalKopf * S.team.length) + ' Einlage' }
  ];

  var gateText = {
    idle: g.vorLaunch
      ? 'Die Messung beginnt am ' + fmtDate(S.settings.launch) + '. Bis dahin zählt der Fahrplan, nicht die Quote.'
      : 'Noch kein Artikel erfasst. Die Ampel springt an, sobald das erste Stück im Log steht.',
    go:  'Kurs stimmt. Bei diesem Tempo ist die 50-Prozent-Marke in sechs Monaten erreichbar.',
    hold:'Unter Plan. Das ist ein Kanal- oder Preisproblem, kein Grund zum Nachkaufen.',
    stop:'Deutlich unter Plan. Wenn das so bleibt, war der Einkauf falsch — nicht die Website.'
  }[g.level];
  var gateBadge = { idle:'wartet', go:'auf Kurs', hold:'nachjustieren', stop:'kritisch' }[g.level];

  var faellig = S.tasks.filter(function(t){
    if(t.done || !t.due) return false;
    var d = dayDiff(today(), t.due);
    return d != null && d <= 7;
  }).sort(function(a,b){ return a.due < b.due ? -1 : 1; }).slice(0, 8);

  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Cockpit</span><h1>' + esc(begruessung()) + '</h1>';
  h += '<p>' + (tageSeitLaunch != null && tageSeitLaunch >= 0
        ? 'Tag ' + tageSeitLaunch + ' der Messung. Noch ' + (tageBisGate != null ? tageBisGate : '—') + ' Tage bis zum Gate am ' + fmtDate(S.settings.gate) + '.'
        : 'Launch am ' + fmtDate(S.settings.launch) + ', Gate am ' + fmtDate(S.settings.gate) + '. Noch ' + (dayDiff(today(), S.settings.launch) || 0) + ' Tage bis zum ersten Inserat.')
     + '</p></div>';

  h += '<div class="kpis">' + kpis.map(function(k){
    return '<div class="kpi ' + (k.c||'') + '"><span class="k-label">' + esc(k.l) + '</span>' +
           '<span class="k-val">' + k.v + '</span><span class="k-sub">' + esc(k.s) + '</span></div>';
  }).join('') + '</div>';

  h += '<span class="section-label">Gate-Regel</span>';
  h += '<div class="card"><div class="card-head"><span class="dot ' + g.level + '"></span>' +
       '<h3>' + g.sold + ' von ' + g.base + ' verkauft</h3>' +
       '<span class="badge ' + (g.level === 'idle' ? 'plain' : g.level) + '">' + gateBadge + '</span></div>' +
       '<div class="bar ' + g.level + '"><i style="width:' + Math.min(100, g.base ? g.sold/g.base*100 : 0) + '%"></i></div>' +
       '<p class="card-note" style="margin-top:12px">' + esc(gateText) +
       (st.n && st.n < g.base ? ' Erst ' + st.n + ' von ' + g.base + ' Stück beschafft.' : '') + '</p>' +
       '<table class="kv"><tbody>' +
       '<tr><td>ab ' + g.go + ' verkauft</td><td class="muted">Charge 2 mit doppelter Menge, gleiche Kriterien</td></tr>' +
       '<tr><td>' + g.hold + '–' + (g.go-1) + ' verkauft</td><td class="muted">kein Nachkauf, erst Kanal und Preis korrigieren</td></tr>' +
       '<tr><td>unter ' + g.hold + ' verkauft</td><td class="muted">Restbestand abverkaufen, Kriterien neu oder Stopp</td></tr>' +
       '</tbody></table>' +
       '<p class="card-note" style="margin-top:10px">Zusätzlich: liegt der Stundenlohn unter CHF ' + chf(S.settings.satz) + ', schlägt das Projekt keinen Nebenjob. Auch das gehört ausgesprochen.</p></div>';

  h += '<div class="grid two">';
  h += '<div><span class="section-label">Fällig in den nächsten 7 Tagen</span><div class="card flush">';
  if(!faellig.length){
    h += '<div class="empty"><span class="e-big">Nichts fällig</span>Entweder ist alles erledigt oder die Fristen liegen weiter draussen.</div>';
  } else {
    h += '<ul class="list">' + faellig.map(function(t){
      var d = dayDiff(today(), t.due);
      var cls = d < 0 ? 'stop' : (d <= 1 ? 'hold' : 'plain');
      return '<li class="row" data-task="' + t.id + '"><span class="dot ' + (d<0?'stop':(d<=1?'hold':'')) + '" style="margin-top:6px"></span>' +
             '<div class="r-main"><div class="r-title">' + esc(t.t) + '</div>' +
             '<div class="r-meta"><span class="badge ' + cls + '">' + (d<0 ? Math.abs(d)+' Tage überfällig' : (d===0?'heute':(d===1?'morgen':'in '+d+' Tagen'))) + '</span>' +
             '<span>' + esc(personName(t.w)) + '</span><span class="faint">' + esc(phaseOf(t.p).name) + '</span></div></div></li>';
    }).join('') + '</ul>';
  }
  h += '</div></div>';

  h += '<div><span class="section-label">Aufgaben insgesamt</span><div class="card">' +
       '<div class="card-head"><h3>' + ts.done + ' von ' + ts.n + ' erledigt</h3><span class="card-note">' + pct(ts.pct) + '</span></div>' +
       '<div class="bar"><i style="width:' + (ts.pct*100) + '%"></i></div>' +
       '<p class="card-note" style="margin-top:12px">' + ts.offen + ' offen' +
       (ts.over ? ', davon <b style="color:var(--stop)">' + ts.over + ' überfällig</b>' : '') + '.</p>' +
       '<div class="btnrow"><button class="btn ghost sm" data-go="tasks">Zu den Aufgaben</button>' +
       '<button class="btn ghost sm" data-go="buy">Kaufentscheid</button></div></div>';

  h += '<span class="section-label">Lager</span><div class="card">' +
       '<table class="kv"><tbody>' +
       '<tr><td>Im Lager, noch nicht online</td><td class="num">' + st.lager + '</td></tr>' +
       '<tr><td>Online</td><td class="num">' + st.online + '</td></tr>' +
       '<tr><td>Verkauft</td><td class="num">' + st.sold + '</td></tr>' +
       '<tr><td>Median-Liegedauer</td><td class="num">' + (st.medianLiege != null ? st.medianLiege + ' T' : '—') + '</td></tr>' +
       '<tr><td>Länger als 90 Tage online</td><td class="num' + (st.ueber90 ? ' ' : '') + '">' + st.ueber90 + '</td></tr>' +
       '</tbody></table></div></div>';

  $('#v-cockpit').innerHTML = h;
}
function begruessung(){
  var h = new Date().getHours();
  var t = h < 5 ? 'Noch wach' : h < 11 ? 'Guten Morgen' : h < 14 ? 'Mittag' : h < 18 ? 'Guten Nachmittag' : 'Guten Abend';
  return t + '.';
}

/* ----------------------------------------------------------- Fahrplan ---- */
function renderPlan(){
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Fahrplan</span><h1>Von heute bis zum Gate</h1>' +
       '<p>Sechs Phasen, 21 Wochen. Der Plan hält so lange, wie die Annahmen halten — was sich ändert, gehört ins Entscheid-Log, nicht in den Kopf.</p></div>';

  h += SEED.phases.map(function(p){
    var offen = S.tasks.filter(function(t){ return t.p === p.id && !t.done; }).length;
    var total = S.tasks.filter(function(t){ return t.p === p.id; }).length;
    var t = today();
    var state = p.bis < t ? 'done' : (p.von <= t ? 'now' : '');
    if(state === 'done' && offen > 0) state = '';
    return '<div class="phase ' + state + '">' +
      '<span class="p-when">' + fmtShort(p.von) + ' – ' + fmtDate(p.bis) + ' · ' + esc(p.nr) + '</span>' +
      '<div class="p-title">' + esc(p.name) + (state === 'now' ? ' <span class="badge cool">läuft</span>' : '') + '</div>' +
      '<div class="p-goal">' + esc(p.ziel) + '</div>' +
      '<ul>' + p.punkte.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<div class="r-meta" style="margin-top:9px"><span class="badge plain">' + (total-offen) + '/' + total + ' Aufgaben</span></div>' +
      '</div>';
  }).join('');

  h += '<span class="section-label">Nebenstränge</span>';
  h += '<div class="grid two">' +
    '<div class="card"><div class="card-head"><h3>Uhren</h3><span class="badge sand">ab Woche 9</span></div>' +
    '<p class="card-note">Kein Wareneinkauf, deshalb kein Kapital. Dafür Haftung: Wer die Rechnung stellt, haftet gegenüber dem Kunden. Bis der Vertrag steht und die Vermittlungskonstruktion sauber ist, geht keine Uhr online. Start mit drei Stück, nicht dreissig.</p></div>' +
    '<div class="card"><div class="card-head"><h3>Bänder</h3><span class="badge sand">ab Woche 12</span></div>' +
    '<p class="card-note">Recherche im November, Entscheid nach dem Gate, Produktion im Frühjahr, Ware etwa März bis Mai 2027. Die Mindestbestellmenge entscheidet über alles: Bei MOQ 100 und vier Artikeln liegen CHF 4\'800 im Lager — fast doppelt so viel wie die gesamte Kleider-Charge.</p></div>' +
    '</div>';

  $('#v-plan').innerHTML = h;
}

/* ----------------------------------------------------------- Aufgaben ---- */
function renderTasks(){
  var f = filters.task, w = filters.taskWho;
  var list = S.tasks.filter(function(t){
    if(f === 'offen' && t.done) return false;
    if(f === 'erledigt' && !t.done) return false;
    if(f === 'ueberfaellig' && (t.done || !t.due || t.due >= today())) return false;
    if(w && t.w !== w) return false;
    return true;
  }).sort(function(a,b){
    if(a.done !== b.done) return a.done ? 1 : -1;
    return (a.due||'9999') < (b.due||'9999') ? -1 : 1;
  });

  var ts = taskStats();
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Aufgaben</span><h1>' + ts.offen + ' offen</h1>' +
       '<p>Jede Aufgabe hat eine Person und eine Frist. Ändert beides, wenn es nicht passt — ein Plan, den niemand anfasst, ist keiner.</p></div>';

  h += '<div class="seg" style="margin-bottom:12px">' +
    [['offen','Offen'],['ueberfaellig','Überfällig'],['erledigt','Erledigt'],['alle','Alle']].map(function(o){
      return '<button data-tf="' + o[0] + '" class="' + (f===o[0]?'on':'') + '">' + o[1] + '</button>';
    }).join('') + '</div>';

  h += '<div class="chips"><button class="chip ' + (!w?'on':'') + '" data-tw="">Alle</button>' +
    S.team.map(function(p){
      return '<button class="chip ' + (w===p.id?'on':'') + '" data-tw="' + p.id + '">' + esc(p.name) + '</button>';
    }).join('') + '</div>';

  h += '<div class="btnrow" style="margin-bottom:14px"><button class="btn sm" data-newtask="1">Aufgabe hinzufügen</button></div>';

  if(!list.length){
    h += '<div class="card"><div class="empty"><span class="e-big">Nichts hier</span>Andere Ansicht wählen oder eine Aufgabe hinzufügen.</div></div>';
  } else {
    var byPhase = {};
    list.forEach(function(t){ (byPhase[t.p] = byPhase[t.p] || []).push(t); });
    SEED.phases.forEach(function(p){
      var arr = byPhase[p.id];
      if(!arr || !arr.length) return;
      h += '<span class="section-label">' + esc(p.nr + ' — ' + p.name) + ' · ' + fmtShort(p.von) + '–' + fmtShort(p.bis) + '</span>';
      h += '<div class="card flush"><ul class="list">' + arr.map(taskRow).join('') + '</ul></div>';
    });
    var rest = list.filter(function(t){ return !SEED.phases.some(function(p){ return p.id === t.p; }); });
    if(rest.length){
      h += '<span class="section-label">Eigene Aufgaben</span>';
      h += '<div class="card flush"><ul class="list">' + rest.map(taskRow).join('') + '</ul></div>';
    }
  }
  $('#v-tasks').innerHTML = h;
}
function taskRow(t){
  var over = !t.done && t.due && t.due < today();
  return '<li class="row"><input type="checkbox" data-toggle="' + t.id + '" ' + (t.done?'checked':'') +
    ' style="width:19px;height:19px;margin-top:3px;accent-color:var(--ink);flex:none">' +
    '<div class="r-main" data-task="' + t.id + '" style="cursor:pointer">' +
    '<div class="r-title" style="' + (t.done?'color:var(--ink-faint);text-decoration:line-through':'') + '">' + esc(t.t) + '</div>' +
    '<div class="r-meta">' +
      '<span class="badge ' + (over?'stop':'plain') + '">' + fmtShort(t.due) + '</span>' +
      '<span>' + esc(personName(t.w)) + '</span>' +
      (t.est ? '<span class="faint">' + (t.est >= 60 ? (t.est/60).toFixed(1).replace('.0','').replace('.',',') + ' h' : t.est + ' min') + '</span>' : '') +
      (t.d ? '<span class="faint">· Details</span>' : '') +
    '</div></div></li>';
}

/* ------------------------------------------------------------ Artikel ---- */
function renderItems(){
  var f = filters.item;
  var list = S.items.filter(function(i){
    var st = i.soldDate ? 'verkauft' : (i.listDate ? 'online' : 'lager');
    return f === 'alle' || f === st;
  }).sort(function(a,b){ return (b.buyDate||'') < (a.buyDate||'') ? -1 : 1; });

  var st = stats();
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Artikel</span><h1>' + st.n + ' Stück erfasst</h1>' +
       '<p>Ein Datensatz pro Stück, von der Kasse bis zum Verkauf. Aus diesen Zeilen entsteht die einzige Zahl, die am Gate zählt.</p></div>';

  h += '<div class="kpis" style="margin-bottom:14px">' +
    '<div class="kpi"><span class="k-label">Im Lager</span><span class="k-val">' + st.lager + '</span></div>' +
    '<div class="kpi"><span class="k-label">Online</span><span class="k-val">' + st.online + '</span></div>' +
    '<div class="kpi"><span class="k-label">Verkauft</span><span class="k-val">' + st.sold + '</span></div>' +
    '<div class="kpi"><span class="k-label">Median-Liegedauer</span><span class="k-val">' + (st.medianLiege != null ? st.medianLiege : '—') + '<small> Tage</small></span></div>' +
    '</div>';

  h += '<div class="seg" style="margin-bottom:12px">' +
    [['alle','Alle'],['lager','Lager'],['online','Online'],['verkauft','Verkauft']].map(function(o){
      return '<button data-if="' + o[0] + '" class="' + (f===o[0]?'on':'') + '">' + o[1] + '</button>';
    }).join('') + '</div>';

  h += '<div class="btnrow" style="margin-bottom:14px">' +
    '<button class="btn sm" data-newitem="1">Artikel erfassen</button>' +
    '<button class="btn ghost sm" data-go="buy">Kaufentscheid</button>' +
    (S.items.length ? '<button class="btn ghost sm" data-export="katalog">Katalog exportieren</button>' : '') +
    '</div>';

  if(!list.length){
    h += '<div class="card"><div class="empty"><span class="e-big">Noch nichts erfasst</span>' +
         'Jedes gekaufte Stück gehört hier hinein — mit Einkaufspreis und Bearbeitungszeit. Ohne diese zwei Zahlen ist der 90-Tage-Test wertlos.</div></div>';
  } else {
    h += '<div class="card flush"><div class="tablewrap"><table><thead><tr>' +
      '<th>Stück</th><th class="num">EK</th><th class="num">VK</th><th>Status</th><th class="num">Tage</th><th class="num">DB</th>' +
      '</tr></thead><tbody>' + list.map(function(i){
        var sold = !!i.soldDate;
        var status = sold ? 'verkauft' : (i.listDate ? 'online' : 'Lager');
        var tage = sold ? dayDiff(i.listDate, i.soldDate) : (i.listDate ? dayDiff(i.listDate, today()) : null);
        var db = sold ? num(i.soldChf) - num(i.feesChf) - num(i.shipChf) - num(i.ekChf) : null;
        return '<tr data-item="' + i.id + '" class="' + (sold?'is-sold':'') + '" style="cursor:pointer">' +
          '<td><b style="font-weight:500">' + esc(i.title || 'ohne Titel') + '</b>' +
            (i.brand ? '<br><span class="faint" style="font-size:11.5px">' + esc(i.brand) + (i.size?' · '+esc(i.size):'') + '</span>' : '') + '</td>' +
          '<td class="num">' + chf(i.ekChf) + '</td>' +
          '<td class="num">' + (sold ? chf(i.soldChf) : (i.askChf ? chf(i.askChf) : '—')) + '</td>' +
          '<td><span class="badge ' + (sold?'go':(i.listDate?'cool':'plain')) + '">' + status + '</span></td>' +
          '<td class="num">' + (tage != null ? tage : '—') + '</td>' +
          '<td class="num" style="color:' + (db == null ? 'inherit' : (db >= 0 ? 'var(--go)' : 'var(--stop)')) + '">' + (db != null ? chf(db) : '—') + '</td>' +
          '</tr>';
      }).join('') + '</tbody></table></div></div>';
  }
  $('#v-items').innerHTML = h;
}

/* -------------------------------------------------------- Kaufentscheid -- */
function buyVerdictHtml(){
  var s = S.settings;
  var ek = num(buy.ek, 0), vk = num(buy.vk, 0);
  var offen = SEED.criteria.filter(function(c, i){ return !buy.checked[i]; });
  var fails = [];
  if(ek > 0 && ek < s.ekMin) fails.push('Einkauf unter der Untergrenze von CHF ' + chf(s.ekMin));
  if(ek > 0 && vk > 0 && vk < ek * 3) fails.push('Verkaufspreis unter dem Dreifachen des Einkaufs');
  if(vk > 0 && vk < 180) fails.push('Verkaufspreis unter CHF 180 — falsches Segment');
  if(offen.length) fails.push(offen.length + ' von ' + SEED.criteria.length + ' Kriterien nicht bestätigt');

  var ready = ek > 0 && vk > 0;
  var level = !ready ? 'neutral' : (fails.length ? 'stop' : 'go');
  var m = ready ? model({ek:ek, vk:vk}) : null;

  var h = '<div class="verdict ' + (level === 'neutral' ? '' : level) + '">';
  if(!ready){
    h += '<span class="v-word">Beide Preise eintragen</span><span class="v-why">Ohne Einkauf und realistischen Verkaufspreis gibt es keinen Entscheid, nur ein Gefühl.</span>';
  } else if(level === 'go'){
    h += '<span class="v-word">Kaufen</span><span class="v-why">Alle Kriterien bestätigt. Bei ' + pct(m.q) + ' Durchverkauf bringt dieses Stück CHF ' + chf(m.db) + ' Deckungsbeitrag, das sind CHF ' + chf(m.proStunde) + ' pro Arbeitsstunde.</span>';
  } else {
    h += '<span class="v-word">Nicht kaufen</span><span class="v-why">' + esc(fails.join(' · ')) + '</span>';
  }
  h += '</div>';

  if(ready){
    h += '<table class="kv" style="margin-top:14px"><tbody>' +
      '<tr><td>Spanne</td><td class="num">' + (vk/ek).toFixed(1).replace('.',',') + ' ×</td></tr>' +
      '<tr><td>Risiko bei Fehlkauf</td><td class="num">CHF ' + chf(ek) + '</td></tr>' +
      '<tr><td>Nötige Quote, damit kein Verlust entsteht</td><td class="num">' + (m.breakEven != null ? pct(m.breakEven,1) : '—') + '</td></tr>' +
      '<tr><td>Nötige Quote, damit die Arbeit bezahlt ist</td><td class="num">' + (m.gratis != null ? pct(m.gratis,1) : '—') + '</td></tr>' +
      '</tbody></table>';
  }
  return h;
}

function renderBuy(){
  var s = S.settings;
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Kaufentscheid</span><h1>Kaufen oder liegen lassen</h1>' +
       '<p>Im Laden auszufüllen, bevor Geld fliesst. Dauert zwei Minuten und kostet weniger als ein Fehlkauf für CHF ' + chf(s.ek) + '.</p></div>';

  h += '<div class="card"><div class="field-row">' +
    '<div class="field"><label>Einkaufspreis CHF</label><input type="number" inputmode="decimal" id="buy-ek" value="' + esc(buy.ek) + '" placeholder="90"></div>' +
    '<div class="field"><label>Realistischer VK CHF</label><input type="number" inputmode="decimal" id="buy-vk" value="' + esc(buy.vk) + '" placeholder="280"></div>' +
    '</div>';
  h += '<div id="buy-verdict">' + buyVerdictHtml() + '</div>';
  h += '</div>';

  h += '<span class="section-label">Die harten Kriterien — alle oder keiner</span>';
  h += '<div class="card">' + SEED.criteria.map(function(c, i){
    return '<label class="check ' + (buy.checked[i]?'done':'') + '">' +
      '<input type="checkbox" data-crit="' + i + '" ' + (buy.checked[i]?'checked':'') + '>' +
      '<span class="c-txt"><span class="c-main">' + esc(c.t) + '</span>' +
      '<span class="c-sub">' + esc(c.d) + '</span></span></label>';
  }).join('') + '</div>';

  h += '<div class="btnrow"><button class="btn ghost" data-buyreset="1">Zurücksetzen</button>' +
       '<button class="btn" data-buysave="1">Als Artikel erfassen</button></div>';

  $('#v-buy').innerHTML = h;
}

/* -------------------------------------------------------------- Zahlen --- */
function renderNumbers(){
  var s = S.settings, m = model();
  var st = stats();

  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Zahlen</span><h1>Was ein Stück verdient</h1>' +
       '<p>Gerechnet pro beschafftem Stück, nicht pro verkauftem. Nur so zählt jeder Ladenhüter mit, und genau daran scheitert die Rechnung sonst.</p></div>';

  var sliders = [
    ['vk','Verkaufspreis','CHF',80,600,10],
    ['ek','Einkaufspreis','CHF',20,300,5],
    ['quote','Durchverkaufsquote','%',10,100,5],
    ['minuten','Arbeitszeit je Stück','min',20,180,5],
    ['kvar','Versand, Verpackung, Gebühren','CHF',0,60,1],
    ['satz','Interner Stundensatz','CHF',10,80,1]
  ];
  h += '<div class="card">' + sliders.map(function(sl){
    return '<div class="field"><label>' + esc(sl[1]) + ' <span class="mono" style="float:right;color:var(--ink);letter-spacing:0">' +
      chf(s[sl[0]]) + ' ' + sl[2] + '</span></label>' +
      '<input type="range" data-set="' + sl[0] + '" min="' + sl[3] + '" max="' + sl[4] + '" step="' + sl[5] + '" value="' + s[sl[0]] + '"></div>';
  }).join('') + '</div>';

  h += '<div class="kpis">' +
    '<div class="kpi ' + (m.db > 0 ? 'go' : 'stop') + '"><span class="k-label">DB je beschafftem Stück</span><span class="k-val">' + chf(m.db) + '</span><span class="k-sub">CHF</span></div>' +
    '<div class="kpi ' + (m.proStunde >= s.satz ? 'go' : 'hold') + '"><span class="k-label">Pro Arbeitsstunde</span><span class="k-val">' + chf(m.proStunde) + '</span><span class="k-sub">CHF</span></div>' +
    '<div class="kpi"><span class="k-label">Kein Verlust ab</span><span class="k-val">' + (m.breakEven != null ? (m.breakEven*100).toFixed(1).replace('.',',') : '—') + '<small> %</small></span><span class="k-sub">Durchverkauf</span></div>' +
    '<div class="kpi"><span class="k-label">Arbeit bezahlt ab</span><span class="k-val">' + (m.gratis != null ? (m.gratis*100).toFixed(1).replace('.',',') : '—') + '<small> %</small></span><span class="k-sub">Durchverkauf</span></div>' +
    '</div>';

  h += '<div class="card" style="margin-top:14px"><p class="card-note mb0">' +
    'Bei ' + chf(s.stueck) + ' Stück ergibt das <b>CHF ' + chf(m.db * s.stueck) + '</b> Deckungsbeitrag über die ganze Charge, bei ' +
    chf(s.stueck * s.minuten / 60, 1) + ' Arbeitsstunden zu dritt. Kapitalbindung beim Start: CHF ' + chf(s.stueck * s.ek) +
    ', also CHF ' + chf(s.stueck * s.ek / S.team.length) + ' pro Kopf.</p></div>';

  /* Sensitivität */
  var quoten = [30,40,50,60,70,80];
  var eks = [70,80,90,110,130];
  h += '<span class="section-label">Empfindlichkeit: Quote gegen Einkaufspreis</span>';
  h += '<div class="card flush"><div class="tablewrap"><table><thead><tr><th>EK ↓ / Quote →</th>' +
    quoten.map(function(q){ return '<th class="num">' + q + ' %</th>'; }).join('') + '</tr></thead><tbody>' +
    eks.map(function(e){
      return '<tr><td class="num">' + chf(e) + '</td>' + quoten.map(function(q){
        var d = model({ek:e, quote:q}).db;
        var col = d < 0 ? 'var(--stop)' : (d >= 80 ? 'var(--go)' : 'inherit');
        return '<td class="num" style="color:' + col + '">' + chf(d) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>' +
    '<div style="padding:12px 16px"><p class="card-note mb0">Deckungsbeitrag je beschafftem Stück in CHF. Die Zeile zeigt, was ein besserer Einkaufspreis bringt, die Spalte, was eine bessere Quote bringt. Die Spalte gewinnt.</p></div></div>';

  if(st.n){
    h += '<span class="section-label">Plan gegen Wirklichkeit</span>';
    h += '<div class="card flush"><div class="tablewrap"><table><thead><tr><th></th><th class="num">Plan</th><th class="num">Ist</th></tr></thead><tbody>' +
      '<tr><td>Durchverkaufsquote</td><td class="num">' + pct(m.q) + '</td><td class="num">' + pct(st.quote) + '</td></tr>' +
      '<tr><td>DB je beschafftem Stück</td><td class="num">' + chf(m.db) + '</td><td class="num">' + chf(st.dbProStueck) + '</td></tr>' +
      '<tr><td>Pro Arbeitsstunde</td><td class="num">' + chf(m.proStunde) + '</td><td class="num">' + chf(st.proStunde) + '</td></tr>' +
      '<tr><td>Ø Einkaufspreis</td><td class="num">' + chf(s.ek) + '</td><td class="num">' + chf(st.n ? st.ekTotal/st.n : 0) + '</td></tr>' +
      '</tbody></table></div></div>';
  }
  $('#v-numbers').innerHTML = h;
}

/* ------------------------------------------------------------- Stunden --- */
function renderHours(){
  var byPerson = {};
  S.team.forEach(function(p){ byPerson[p.id] = 0; });
  S.hours.forEach(function(e){ byPerson[e.personId] = (byPerson[e.personId]||0) + num(e.minutes); });
  S.items.forEach(function(i){
    if(i.prepBy && byPerson[i.prepBy] !== undefined) byPerson[i.prepBy] += num(i.prepMin);
  });
  var total = Object.keys(byPerson).reduce(function(a,k){ return a + byPerson[k]; }, 0);

  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Stundenkonto</span><h1>' + chf(total/60, 1) + ' Stunden erfasst</h1>' +
       '<p>Ungleiche Zeit ist in Ordnung, ungeklärte Erwartung nicht. Erfasste Stunden werden mit CHF ' + chf(S.settings.satz) +
       ' als Vorwegvergütung aus dem Gewinn abgegolten, der Rest zu je einem Drittel. Kein Gewinn, keine Vergütung — so entsteht nie eine Lohnschuld.</p></div>';

  h += '<div class="card">' + S.team.map(function(p){
    var min = byPerson[p.id] || 0;
    var share = total ? min/total : 0;
    return '<div style="margin-bottom:16px"><div class="card-head" style="margin-bottom:6px">' +
      '<h3 style="font-size:16px">' + esc(p.name) + '</h3>' +
      '<span class="mono muted">' + chf(min/60,1) + ' h · ' + pct(share) + '</span></div>' +
      '<div class="bar"><i style="width:' + (share*100) + '%"></i></div>' +
      '<p class="card-note" style="margin:7px 0 0">Vorwegvergütung bei aktuellem Stand: CHF ' + chf(min/60*S.settings.satz) + '</p></div>';
  }).join('') + '</div>';

  h += '<div class="btnrow" style="margin-bottom:14px"><button class="btn sm" data-newhour="1">Stunden erfassen</button></div>';

  var list = S.hours.slice().sort(function(a,b){ return a.date < b.date ? 1 : -1; }).slice(0, 40);
  if(list.length){
    h += '<div class="card flush"><ul class="list">' + list.map(function(e){
      return '<li class="row"><div class="r-main"><div class="r-title">' + esc(e.note || 'Arbeitszeit') + '</div>' +
        '<div class="r-meta"><span>' + esc(personName(e.personId)) + '</span><span class="faint">' + fmtDate(e.date) + '</span></div></div>' +
        '<div class="r-right">' + chf(num(e.minutes)/60, 1) + ' h<br><button class="btn quiet sm" data-delhour="' + e.id + '" style="padding:2px 0">löschen</button></div></li>';
    }).join('') + '</ul></div>';
  } else {
    h += '<div class="card"><div class="empty"><span class="e-big">Noch keine Stunden</span>Die Bearbeitungszeit pro Artikel zählt automatisch mit, wenn beim Artikel eine Person hinterlegt ist.</div></div>';
  }
  $('#v-hours').innerHTML = h;
}

/* ---------------------------------------------------------- Entscheide --- */
function renderDecisions(){
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Entscheide</span><h1>Was beschlossen wurde</h1>' +
       '<p>Zu dritt ist das Gedächtnis das teuerste Werkzeug. Was hier steht, muss niemand zweimal diskutieren.</p></div>';
  h += '<div class="btnrow" style="margin-bottom:14px"><button class="btn sm" data-newdec="1">Entscheid festhalten</button></div>';

  var list = S.decisions.slice().sort(function(a,b){ return a.date < b.date ? 1 : -1; });
  if(!list.length){
    h += '<div class="card"><div class="empty"><span class="e-big">Noch nichts festgehalten</span>' +
      'Der erste Eintrag ist meistens das Ergebnis des RAV-Gesprächs.</div></div>';
  } else {
    h += list.map(function(d){
      return '<div class="card"><div class="card-head"><h3>' + esc(d.title) + '</h3>' +
        '<span class="badge plain">' + fmtDate(d.date) + '</span></div>' +
        '<p class="card-note" style="white-space:pre-wrap">' + esc(d.text) + '</p>' +
        '<div class="r-meta"><span class="faint">festgehalten von ' + esc(personName(d.by)) + '</span>' +
        '<button class="btn quiet sm" data-deldec="' + d.id + '">löschen</button></div></div>';
    }).join('');
  }
  $('#v-decisions').innerHTML = h;
}

/* --------------------------------------------------------------- Recht --- */
function renderLegal(){
  var groups = [];
  SEED.legal.forEach(function(l, i){
    var g = groups.filter(function(x){ return x.name === l.g; })[0];
    if(!g){ g = {name:l.g, items:[]}; groups.push(g); }
    g.items.push({ l:l, i:i });
  });
  var doneN = S.legal.filter(function(x){ return x.done; }).length;

  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Recht und Admin</span><h1>' + doneN + ' von ' + SEED.legal.length + ' erledigt</h1>' +
       '<p>Kein Ersatz für Beratung. Aber die Punkte, an denen es im Schweizer Handel mit gebrauchter Ware regelmässig klemmt, und was sie konkret bedeuten.</p></div>';

  h += groups.map(function(g){
    return '<span class="section-label">' + esc(g.name) + '</span><div class="card">' + g.items.map(function(o){
      var st = S.legal[o.i] || {done:false};
      return '<label class="check ' + (st.done?'done':'') + '">' +
        '<input type="checkbox" data-legal="' + o.i + '" ' + (st.done?'checked':'') + '>' +
        '<span class="c-txt"><span class="c-main">' + esc(o.l.t) + '</span>' +
        '<span class="c-sub">' + esc(o.l.d) + '</span></span></label>';
    }).join('') + '</div>';
  }).join('');

  h += '<div class="card"><p class="card-note mb0">Quellen für die Zahlen und Fristen auf dieser Seite: IGE (Markengebühren), Art. 210 OR (Gewährleistung), Art. 425 ff. OR (Kommission), Art. 530 ff. OR (einfache Gesellschaft), Art. 71a AVIG (Förderung der selbständigen Erwerbstätigkeit), Stripe (Gebühren Schweiz). Gebühren ändern sich — vor der Ausgabe nachprüfen.</p></div>';
  $('#v-legal').innerHTML = h;
}

/* ----------------------------------------------------------- Strategie --- */
function renderDoc(){
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Strategie</span><h1>Die Überlegung dahinter</h1>' +
       '<p>Warum der Plan so aussieht, wie er aussieht. Zum Nachlesen, wenn im November jemand fragt, weshalb keine zweite Charge gekauft wird.</p></div>';
  h += '<div class="card"><div class="prose">' + SEED.doc.map(function(sec){
    return '<h3>' + esc(sec.h) + '</h3>' + sec.b.map(function(x){ return '<p>' + esc(x.p) + '</p>'; }).join('');
  }).join('') + '</div></div>';
  $('#v-doc').innerHTML = h;
}

/* ------------------------------------------------------------- Mehr ------ */
function renderMore(){
  var links = [
    ['buy','Kaufentscheid','Vor dem Kauf ausfüllen — im Laden, am Handy'],
    ['hours','Stundenkonto','Wer wie viel gearbeitet hat, und was das wert ist'],
    ['decisions','Entscheide','Was beschlossen wurde und wann'],
    ['legal','Recht und Admin','Gesellschaft, Uhren, RAV, Echtheit, Shop, Marke'],
    ['doc','Strategie','Warum der Plan so aussieht'],
    ['settings','Einstellungen','Team, Annahmen, Backup']
  ];
  var h = '<div class="view-head"><span class="eyebrow">Mehr</span><h1>Werkzeuge</h1></div>';
  h += '<div class="card flush"><ul class="list">' + links.map(function(l){
    return '<li class="row" data-go="' + l[0] + '" style="cursor:pointer"><div class="r-main">' +
      '<div class="r-title">' + esc(l[1]) + '</div><div class="r-meta"><span>' + esc(l[2]) + '</span></div></div>' +
      '<div class="r-right faint">›</div></li>';
  }).join('') + '</ul></div>';
  $('#v-more').innerHTML = h;
}

/* ------------------------------------------------------- Einstellungen --- */
function renderSettings(){
  var s = S.settings;
  var h = '';
  h += '<div class="view-head"><span class="eyebrow">Einstellungen</span><h1>Team und Annahmen</h1></div>';

  h += '<span class="section-label">Team</span><div class="card">' + S.team.map(function(p, i){
    return '<div class="field"><label>Person ' + (i+1) + '</label>' +
      '<input type="text" data-team="' + p.id + '" value="' + esc(p.name) + '" placeholder="Name">' +
      '<div class="hint">' + esc(p.role) + '</div></div>';
  }).join('') + '</div>';

  h += '<span class="section-label">Eckdaten</span><div class="card">' +
    '<div class="field-row">' +
    '<div class="field"><label>Launch</label><input type="date" data-date="launch" value="' + esc(s.launch) + '"></div>' +
    '<div class="field"><label>Gate</label><input type="date" data-date="gate" value="' + esc(s.gate) + '"></div>' +
    '</div>' +
    '<div class="field-row">' +
    '<div class="field"><label>Stück in der Charge</label><input type="number" data-nset="stueck" value="' + s.stueck + '"></div>' +
    '<div class="field"><label>Einlage je Kopf CHF</label><input type="number" data-nset="kapitalKopf" value="' + s.kapitalKopf + '"></div>' +
    '</div>' +
    '<div class="field"><label>Preisuntergrenze Einkauf CHF</label><input type="number" data-nset="ekMin" value="' + s.ekMin + '">' +
    '<div class="hint">Der Kaufentscheid lehnt alles darunter ab.</div></div>' +
    '</div>';

  h += '<span class="section-label">Daten</span><div class="card">' +
    '<p class="card-note">Alles liegt lokal auf diesem Gerät. Zum Teilen mit den anderen zwei: Backup schreiben, Datei schicken, dort einlesen. Wer zuletzt einliest, überschreibt — also nicht gleichzeitig an denselben Zahlen arbeiten.</p>' +
    '<div class="btnrow">' +
    '<button class="btn ghost sm" data-export="backup">Backup schreiben</button>' +
    '<button class="btn ghost sm" data-import="1">Backup einlesen</button>' +
    '<button class="btn ghost sm" data-export="katalog">Katalog für den Shop</button>' +
    '<button class="btn ghost sm" data-export="csv">Artikel als CSV</button>' +
    '</div>' +
    '<input type="file" id="importfile" accept="application/json,.json" style="display:none">' +
    '</div>';

  h += '<div class="card"><div class="card-head"><h3>Zurücksetzen</h3></div>' +
    '<p class="card-note">Löscht Artikel, Stunden, Entscheide und alle Häkchen auf diesem Gerät. Vorher ein Backup schreiben.</p>' +
    '<div class="btnrow"><button class="btn danger sm" data-reset="1">Alles zurücksetzen</button></div></div>';

  h += '<div class="card"><p class="card-note mb0 faint">Vintage Mission v1.0 · Daten im localStorage · ' +
       S.tasks.length + ' Aufgaben, ' + S.items.length + ' Artikel, ' + S.hours.length + ' Zeiteinträge</p></div>';

  $('#v-settings').innerHTML = h;
}

/* -------------------------------------------------------------- Modale --- */
function openModal(title, body, onSave, saveLabel){
  var m = $('#modal');
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = body;
  var btn = $('#modal-save');
  btn.textContent = saveLabel || 'Sichern';
  btn.style.display = onSave ? '' : 'none';
  m._onSave = onSave;
  m.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  $('#modal').classList.remove('on');
  document.body.style.overflow = '';
}

function taskModal(id){
  var t = S.tasks.filter(function(x){ return x.id === id; })[0];
  if(!t) return;
  var body = '';
  if(t.d) body += '<div class="prose" style="font-size:14px;margin-bottom:16px"><p>' + esc(t.d) + '</p></div>';
  body += '<div class="field"><label>Aufgabe</label><input type="text" id="m-t" value="' + esc(t.t) + '"></div>';
  body += '<div class="field-row">' +
    '<div class="field"><label>Verantwortlich</label><select id="m-w">' + S.team.map(function(p){
      return '<option value="' + p.id + '" ' + (p.id===t.w?'selected':'') + '>' + esc(p.name) + '</option>';
    }).join('') + '</select></div>' +
    '<div class="field"><label>Frist</label><input type="date" id="m-due" value="' + esc(t.due||'') + '"></div></div>';
  body += '<div class="field-row"><div class="field"><label>Aufwand in Minuten</label><input type="number" id="m-est" value="' + (t.est||'') + '"></div>' +
    '<div class="field"><label>Phase</label><select id="m-p">' + SEED.phases.map(function(p){
      return '<option value="' + p.id + '" ' + (p.id===t.p?'selected':'') + '>' + esc(p.nr + ' — ' + p.name) + '</option>';
    }).join('') + '</select></div></div>';
  body += '<div class="field"><label>Notiz</label><textarea id="m-note">' + esc(t.note||'') + '</textarea></div>';
  body += '<div class="btnrow"><button class="btn quiet sm" data-deltask="' + t.id + '">Aufgabe löschen</button></div>';

  openModal('Aufgabe', body, function(){
    t.t = $('#m-t').value.trim() || t.t;
    t.w = $('#m-w').value;
    t.due = $('#m-due').value;
    t.est = num($('#m-est').value, 0);
    t.p = $('#m-p').value;
    t.note = $('#m-note').value;
    save(); render(); toast('Gesichert');
  });
}

function newTaskModal(){
  var body = '<div class="field"><label>Aufgabe</label><input type="text" id="m-t" placeholder="Was ist zu tun?"></div>' +
    '<div class="field-row"><div class="field"><label>Verantwortlich</label><select id="m-w">' +
    S.team.map(function(p){ return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label>Frist</label><input type="date" id="m-due" value="' + today() + '"></div></div>' +
    '<div class="field-row"><div class="field"><label>Aufwand in Minuten</label><input type="number" id="m-est" value="30"></div>' +
    '<div class="field"><label>Phase</label><select id="m-p">' + SEED.phases.map(function(p){
      return '<option value="' + p.id + '">' + esc(p.nr + ' — ' + p.name) + '</option>';
    }).join('') + '</select></div></div>';
  openModal('Neue Aufgabe', body, function(){
    var t = $('#m-t').value.trim();
    if(!t){ toast('Ohne Text keine Aufgabe'); return false; }
    S.tasks.push({ id:uid(), t:t, w:$('#m-w').value, due:$('#m-due').value,
                   est:num($('#m-est').value,0), p:$('#m-p').value, d:'', done:false, doneAt:'' });
    save(); render(); toast('Aufgabe angelegt');
  }, 'Anlegen');
}

function itemModal(id){
  var i = id ? S.items.filter(function(x){ return x.id === id; })[0] : null;
  var neu = !i;
  if(neu) i = { id:uid(), ref:'', title:'', brand:'', cat:'', size:'', cond:'sehr gut',
                ekChf:buy.ek||'', buyDate:today(), prepMin:'', prepBy:S.team[0].id, listDate:'',
                channel:'Shop', askChf:buy.vk||'', soldDate:'', soldChf:'', feesChf:'', shipChf:'',
                authOk:false, authBy:'', note:'' };

  var body = '';
  body += '<div class="field-row"><div class="field"><label>Bezeichnung</label><input type="text" id="i-title" value="' + esc(i.title) + '" placeholder="Wollmantel, camel"></div>' +
    '<div class="field"><label>Marke</label><input type="text" id="i-brand" value="' + esc(i.brand) + '"></div></div>';
  body += '<div class="field-row three"><div class="field"><label>Kategorie</label><input type="text" id="i-cat" value="' + esc(i.cat) + '"></div>' +
    '<div class="field"><label>Grösse</label><input type="text" id="i-size" value="' + esc(i.size) + '"></div>' +
    '<div class="field"><label>Zustand</label><select id="i-cond">' +
      ['neuwertig','sehr gut','gut','getragen'].map(function(c){ return '<option ' + (c===i.cond?'selected':'') + '>' + c + '</option>'; }).join('') +
    '</select></div></div>';

  body += '<span class="section-label" style="margin-top:8px">Einkauf</span>';
  body += '<div class="field-row three"><div class="field"><label>EK CHF</label><input type="number" inputmode="decimal" id="i-ek" value="' + esc(i.ekChf) + '"></div>' +
    '<div class="field"><label>Gekauft am</label><input type="date" id="i-buy" value="' + esc(i.buyDate) + '"></div>' +
    '<div class="field"><label>Wunsch-VK CHF</label><input type="number" inputmode="decimal" id="i-ask" value="' + esc(i.askChf) + '"></div></div>';
  body += '<div class="field-row"><div class="field"><label>Bearbeitung in Minuten</label><input type="number" id="i-prep" value="' + esc(i.prepMin) + '" placeholder="45"></div>' +
    '<div class="field"><label>Bearbeitet von</label><select id="i-prepby">' + S.team.map(function(p){
      return '<option value="' + p.id + '" ' + (p.id===i.prepBy?'selected':'') + '>' + esc(p.name) + '</option>';
    }).join('') + '</select></div></div>';

  body += '<span class="section-label">Online</span>';
  body += '<div class="field-row"><div class="field"><label>Eingestellt am</label><input type="date" id="i-list" value="' + esc(i.listDate) + '"></div>' +
    '<div class="field"><label>Kanal</label><select id="i-chan">' +
      ['Shop','Ricardo','Instagram','anderer'].map(function(c){ return '<option ' + (c===i.channel?'selected':'') + '>' + c + '</option>'; }).join('') +
    '</select></div></div>';

  body += '<span class="section-label">Verkauf</span>';
  body += '<div class="field-row three"><div class="field"><label>Verkauft am</label><input type="date" id="i-sold" value="' + esc(i.soldDate) + '"></div>' +
    '<div class="field"><label>Erlös CHF</label><input type="number" inputmode="decimal" id="i-soldchf" value="' + esc(i.soldChf) + '"></div>' +
    '<div class="field"><label>Gebühren CHF</label><input type="number" inputmode="decimal" id="i-fees" value="' + esc(i.feesChf) + '"></div></div>';
  body += '<div class="field"><label>Versand und Verpackung CHF</label><input type="number" inputmode="decimal" id="i-ship" value="' + esc(i.shipChf) + '"></div>';

  body += '<span class="section-label">Echtheit</span>';
  body += '<label class="check"><input type="checkbox" id="i-auth" ' + (i.authOk?'checked':'') + '>' +
    '<span class="c-txt"><span class="c-main">Prüfprotokoll vollständig abgearbeitet</span><span class="c-sub">' +
    SEED.authCheck.map(function(a){ return esc(a.t); }).join(' · ') + '</span></span></label>';
  body += '<div class="field"><label>Freigegeben von</label><select id="i-authby"><option value="">—</option>' +
    S.team.map(function(p){ return '<option value="' + p.id + '" ' + (p.id===i.authBy?'selected':'') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></div>';
  body += '<div class="field"><label>Notiz</label><textarea id="i-note">' + esc(i.note||'') + '</textarea></div>';
  if(!neu) body += '<div class="btnrow"><button class="btn quiet sm" data-delitem="' + i.id + '">Artikel löschen</button></div>';

  openModal(neu ? 'Artikel erfassen' : 'Artikel', body, function(){
    i.title = $('#i-title').value.trim();
    i.brand = $('#i-brand').value.trim();
    i.cat   = $('#i-cat').value.trim();
    i.size  = $('#i-size').value.trim();
    i.cond  = $('#i-cond').value;
    i.ekChf = $('#i-ek').value;
    i.buyDate = $('#i-buy').value;
    i.askChf  = $('#i-ask').value;
    i.prepMin = $('#i-prep').value;
    i.prepBy  = $('#i-prepby').value;
    i.listDate = $('#i-list').value;
    i.channel  = $('#i-chan').value;
    i.soldDate = $('#i-sold').value;
    i.soldChf  = $('#i-soldchf').value;
    i.feesChf  = $('#i-fees').value;
    i.shipChf  = $('#i-ship').value;
    i.authOk   = $('#i-auth').checked;
    i.authBy   = $('#i-authby').value;
    i.note     = $('#i-note').value;
    if(!i.title){ toast('Bezeichnung fehlt'); return false; }
    if(neu){ S.items.push(i); buy = { checked:{}, ek:'', vk:'' }; }
    save(); render(); toast(neu ? 'Artikel erfasst' : 'Gesichert');
  }, neu ? 'Erfassen' : 'Sichern');
}

function hourModal(){
  var body = '<div class="field-row"><div class="field"><label>Person</label><select id="h-p">' +
    S.team.map(function(p){ return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label>Datum</label><input type="date" id="h-d" value="' + today() + '"></div></div>' +
    '<div class="field"><label>Minuten</label><input type="number" inputmode="numeric" id="h-m" placeholder="90"></div>' +
    '<div class="field"><label>Wofür</label><input type="text" id="h-n" placeholder="Beschaffungsrunde Brocki Olten"></div>';
  openModal('Stunden erfassen', body, function(){
    var m = num($('#h-m').value, 0);
    if(m <= 0){ toast('Minuten fehlen'); return false; }
    S.hours.push({ id:uid(), personId:$('#h-p').value, date:$('#h-d').value, minutes:m, note:$('#h-n').value.trim() });
    save(); render(); toast('Erfasst');
  }, 'Erfassen');
}

function decisionModal(){
  var body = '<div class="field"><label>Worum ging es</label><input type="text" id="d-t" placeholder="Uhren: Vermittlung statt Kommission"></div>' +
    '<div class="field-row"><div class="field"><label>Datum</label><input type="date" id="d-d" value="' + today() + '"></div>' +
    '<div class="field"><label>Festgehalten von</label><select id="d-b">' +
      S.team.map(function(p){ return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="field"><label>Entscheid und Begründung</label><textarea id="d-x" placeholder="Was wurde beschlossen, aus welchem Grund, und was war die Alternative?"></textarea></div>';
  openModal('Entscheid festhalten', body, function(){
    var t = $('#d-t').value.trim();
    if(!t){ toast('Titel fehlt'); return false; }
    S.decisions.push({ id:uid(), title:t, date:$('#d-d').value, by:$('#d-b').value, text:$('#d-x').value.trim() });
    save(); render(); toast('Festgehalten');
  }, 'Festhalten');
}

/* ------------------------------------------------------------- Export ---- */
function download(name, text, type){
  var blob = new Blob([text], { type: type || 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 400);
}
function doExport(kind){
  var stamp = today();
  if(kind === 'backup'){
    download('vintage-mission-backup-' + stamp + '.json', JSON.stringify(S, null, 2));
    toast('Backup geschrieben');
  } else if(kind === 'katalog'){
    var kat = S.items.filter(function(i){ return i.listDate && !i.soldDate; }).map(function(i){
      return { id:i.id, titel:i.title, marke:i.brand, kategorie:i.cat, groesse:i.size,
               zustand:i.cond, preis:num(i.askChf), kanal:i.channel, text:i.note,
               geprueft:!!i.authOk, eingestellt:i.listDate };
    });
    download('shop-katalog-' + stamp + '.json', JSON.stringify({ stand:stamp, artikel:kat }, null, 2));
    toast(kat.length + ' Artikel exportiert');
  } else if(kind === 'csv'){
    var head = ['Bezeichnung','Marke','Kategorie','Groesse','Zustand','EK','Gekauft','BearbMin','Eingestellt','Kanal','WunschVK','Verkauft','Erloes','Gebuehren','Versand','Liegetage','DB'];
    var rows = S.items.map(function(i){
      var db = i.soldDate ? (num(i.soldChf)-num(i.feesChf)-num(i.shipChf)-num(i.ekChf)) : '';
      var lt = i.soldDate ? dayDiff(i.listDate, i.soldDate) : (i.listDate ? dayDiff(i.listDate, today()) : '');
      return [i.title,i.brand,i.cat,i.size,i.cond,i.ekChf,i.buyDate,i.prepMin,i.listDate,i.channel,
              i.askChf,i.soldDate,i.soldChf,i.feesChf,i.shipChf,lt,db];
    });
    var csv = [head].concat(rows).map(function(r){
      return r.map(function(c){ return '"' + String(c==null?'':c).replace(/"/g,'""') + '"'; }).join(';');
    }).join('\r\n');
    download('artikel-' + stamp + '.csv', '﻿' + csv, 'text/csv;charset=utf-8');
    toast('CSV geschrieben');
  }
}
function doImport(file){
  var r = new FileReader();
  r.onload = function(){
    try {
      var st = JSON.parse(r.result);
      if(!st || !st.tasks) throw new Error('kein gültiges Backup');
      S = st;
      Object.keys(SEED.settings).forEach(function(k){
        if(S.settings[k] === undefined) S.settings[k] = SEED.settings[k];
      });
      S.items = S.items || []; S.hours = S.hours || []; S.decisions = S.decisions || [];
      save(); applyTheme(); render(); toast('Backup eingelesen');
    } catch(e){ toast('Datei nicht lesbar'); }
  };
  r.readAsText(file);
}

/* -------------------------------------------------------------- Theme ---- */
function applyTheme(){
  var t = S.settings.theme || 'auto';
  if(t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
function cycleTheme(){
  var order = ['auto','light','dark'];
  var i = order.indexOf(S.settings.theme || 'auto');
  S.settings.theme = order[(i+1) % order.length];
  applyTheme(); save();
  toast({auto:'Systemeinstellung', light:'Hell', dark:'Dunkel'}[S.settings.theme]);
}

/* ------------------------------------------------------------ Ereignisse - */
document.addEventListener('click', function(e){
  var t = e.target;
  var go = t.closest('[data-go]');
  if(go){ view = go.dataset.go; render(); return; }

  if(t.closest('#modal-close') || t.id === 'modal'){ closeModal(); return; }
  if(t.closest('#modal-save')){
    var fn = $('#modal')._onSave;
    /* Die Sicher-Funktion gibt false zurück, wenn eine Eingabe fehlt —
       dann bleibt das Fenster offen. */
    if(!fn || fn() !== false) closeModal();
    return;
  }
  if(t.closest('#themebtn')){ cycleTheme(); return; }

  var tf = t.closest('[data-tf]'); if(tf){ filters.task = tf.dataset.tf; renderTasks(); return; }
  var tw = t.closest('[data-tw]'); if(tw){ filters.taskWho = tw.dataset.tw; renderTasks(); return; }
  var itf = t.closest('[data-if]'); if(itf){ filters.item = itf.dataset.if; renderItems(); return; }

  var tk = t.closest('[data-task]');
  if(tk && !t.closest('[data-toggle]')){ taskModal(tk.dataset.task); return; }
  if(t.closest('[data-newtask]')){ newTaskModal(); return; }
  var dt = t.closest('[data-deltask]');
  if(dt){
    S.tasks = S.tasks.filter(function(x){ return x.id !== dt.dataset.deltask; });
    save(); closeModal(); render(); toast('Gelöscht'); return;
  }

  var im = t.closest('[data-item]'); if(im){ itemModal(im.dataset.item); return; }
  if(t.closest('[data-newitem]')){ itemModal(null); return; }
  var di = t.closest('[data-delitem]');
  if(di){
    S.items = S.items.filter(function(x){ return x.id !== di.dataset.delitem; });
    save(); closeModal(); render(); toast('Gelöscht'); return;
  }

  if(t.closest('[data-newhour]')){ hourModal(); return; }
  var dh = t.closest('[data-delhour]');
  if(dh){ S.hours = S.hours.filter(function(x){ return x.id !== dh.dataset.delhour; }); save(); render(); return; }

  if(t.closest('[data-newdec]')){ decisionModal(); return; }
  var dd = t.closest('[data-deldec]');
  if(dd){ S.decisions = S.decisions.filter(function(x){ return x.id !== dd.dataset.deldec; }); save(); render(); return; }

  if(t.closest('[data-buyreset]')){ buy = { checked:{}, ek:'', vk:'' }; renderBuy(); return; }
  if(t.closest('[data-buysave]')){
    if(!buy.ek){ toast('Einkaufspreis fehlt'); return; }
    itemModal(null); return;
  }

  var ex = t.closest('[data-export]'); if(ex){ doExport(ex.dataset.export); return; }
  if(t.closest('[data-import]')){ $('#importfile').click(); return; }
  if(t.closest('[data-reset]')){
    if(confirm('Wirklich alles auf diesem Gerät zurücksetzen? Artikel, Stunden, Entscheide und alle Häkchen gehen verloren.')){
      S = fresh(); save(); applyTheme(); render(); toast('Zurückgesetzt');
    }
    return;
  }
});

document.addEventListener('change', function(e){
  var t = e.target;
  var tg = t.closest('[data-toggle]');
  if(tg){
    var task = S.tasks.filter(function(x){ return x.id === tg.dataset.toggle; })[0];
    if(task){ task.done = t.checked; task.doneAt = t.checked ? today() : ''; save(); renderTasks(); }
    return;
  }
  var lg = t.closest('[data-legal]');
  if(lg){
    var idx = +lg.dataset.legal;
    if(!S.legal[idx]) S.legal[idx] = { id:'l'+idx, done:false, note:'' };
    S.legal[idx].done = t.checked; save(); renderLegal(); return;
  }
  var cr = t.closest('[data-crit]');
  if(cr){
    buy.checked[+cr.dataset.crit] = t.checked;
    var lab = cr.closest('.check');
    if(lab) lab.classList.toggle('done', t.checked);
    refreshVerdict();
    return;
  }

  var tm = t.closest('[data-team]');
  if(tm){
    var p = S.team.filter(function(x){ return x.id === tm.dataset.team; })[0];
    if(p){ p.name = t.value.trim() || p.name; save(); render(); }
    return;
  }
  var dz = t.closest('[data-date]');
  if(dz){ S.settings[dz.dataset.date] = t.value; save(); return; }
  var ns = t.closest('[data-nset]');
  if(ns){ S.settings[ns.dataset.nset] = num(t.value, S.settings[ns.dataset.nset]); save(); return; }

  if(t.id === 'importfile' && t.files && t.files[0]){ doImport(t.files[0]); return; }
});

document.addEventListener('input', function(e){
  var t = e.target;
  var st = t.closest('[data-set]');
  if(st){
    S.settings[st.dataset.set] = num(t.value, S.settings[st.dataset.set]);
    save();
    /* nur die Zahlen neu zeichnen, damit der Regler unter dem Finger bleibt */
    var lbl = st.previousElementSibling && st.previousElementSibling.querySelector('span');
    if(lbl) lbl.textContent = chf(S.settings[st.dataset.set]) + ' ' + lbl.textContent.split(' ').pop();
    updateNumberKpis();
    return;
  }
  if(t.id === 'buy-ek'){ buy.ek = t.value; refreshVerdict(); return; }
  if(t.id === 'buy-vk'){ buy.vk = t.value; refreshVerdict(); return; }
});

/* Teil-Aktualisierungen, damit Eingabefelder den Fokus behalten */
function updateNumberKpis(){
  var m = model(), s = S.settings;
  var k = $$('#v-numbers .kpi .k-val');
  if(k.length < 4) return;
  k[0].textContent = chf(m.db);
  k[1].textContent = chf(m.proStunde);
  k[2].innerHTML = (m.breakEven != null ? (m.breakEven*100).toFixed(1).replace('.',',') : '—') + '<small> %</small>';
  k[3].innerHTML = (m.gratis != null ? (m.gratis*100).toFixed(1).replace('.',',') : '—') + '<small> %</small>';
  $$('#v-numbers .kpi')[0].className = 'kpi ' + (m.db > 0 ? 'go' : 'stop');
  $$('#v-numbers .kpi')[1].className = 'kpi ' + (m.proStunde >= s.satz ? 'go' : 'hold');
}
function refreshVerdict(){
  var box = $('#buy-verdict');
  if(box) box.innerHTML = buyVerdictHtml();
}

/* ---------------------------------------------------------------- Start -- */
function boot(){
  S = load();
  applyTheme();
  save();
  render();
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
