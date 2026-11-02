/* fair[e]ici - page d'export des références (/admin/export/) */
(function () {
  'use strict';
  var EXP = window.EXPERTISES || {}, SITE = window.SITE || {};
  var base = String(SITE.url || location.origin).replace(/\/$/, '');
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var years = function (a) { var m = String(a || '').match(/\d{4}/g) || []; m = m.map(Number); return m.length ? [Math.min.apply(null, m), Math.max.apply(null, m)] : [0, 0]; };
  var P = (window.PROJETS || []).map(function (p, i) {
    var ex = [].concat(p.expertise || []);
    var y = years(p.annee);
    return Object.assign({}, p, { i: i, y0: y[0], y1: y[1], exKeys: ex, exNames: ex.map(function (k) { return EXP[k] || k; }), lien: base + '/realisations/' + p.slug + '.html', on: true });
  }).sort(function (a, b) { return b.y1 - a.y1 || a.i - b.i; });

  var $ = function (id) { return document.getElementById(id); };
  var fFrom = $('fFrom'), fTo = $('fTo'), fExp = $('fExp'), rows = $('rows'), count = $('count');
  var ys = []; P.forEach(function (p) { for (var y = p.y0; y && y <= p.y1; y++) if (ys.indexOf(y) < 0) ys.push(y); });
  ys.sort(function (a, b) { return a - b; });
  fFrom.innerHTML = '<option value="0">Toutes</option>' + ys.map(function (y) { return '<option>' + y + '</option>'; }).join('');
  fTo.innerHTML = '<option value="9999">Toutes</option>' + ys.slice().reverse().map(function (y) { return '<option>' + y + '</option>'; }).join('');
  fExp.innerHTML = '<option value="">Toutes</option>' + Object.keys(EXP).map(function (k) { return '<option value="' + k + '">' + esc(EXP[k]) + '</option>'; }).join('');

  function visible() {
    var a = +fFrom.value, b = +fTo.value, e = fExp.value;
    return P.filter(function (p) { return (!p.y1 || (p.y1 >= a && p.y0 <= b)) && (!e || p.exKeys.indexOf(e) >= 0); });
  }
  function chosen() { return visible().filter(function (p) { return p.on; }); }
  function render() {
    var v = visible();
    rows.innerHTML = v.length ? v.map(function (p) {
      return '<tr class="' + (p.on ? '' : 'off') + '"><td class="ex-c"><input type="checkbox" data-i="' + p.i + '"' + (p.on ? ' checked' : '') + ' aria-label="Inclure"></td>' +
        '<td class="ex-nowrap">' + esc(p.annee) + '</td><td class="ex-client">' + esc(p.client) + '</td><td><a href="' + esc(p.lien) + '" target="_blank" rel="noopener">' + esc(p.titre) + '</a></td>' +
        '<td class="ex-hide-s">' + esc(p.localite) + '</td><td class="ex-hide-s">' + p.exNames.map(function (n) { return '<span class="ex-tag">' + esc(n) + '</span>'; }).join('') + '</td>' +
        '<td class="ex-hide-s ex-nowrap">' + esc(p.budget) + '</td></tr>';
    }).join('') : '<tr><td colspan="7" class="ex-empty">Aucune référence pour ces filtres.</td></tr>';
    var n = chosen().length;
    count.textContent = n + ' sélectionnée' + (n > 1 ? 's' : '') + ' sur ' + v.length + ' affichée' + (v.length > 1 ? 's' : '');
    ['bBook', 'bXls', 'bTab'].forEach(function (id) { $(id).disabled = !n; });
  }
  rows.addEventListener('change', function (e) {
    var i = e.target.getAttribute('data-i'); if (i == null) return;
    P.forEach(function (p) { if (p.i === +i) p.on = e.target.checked; }); render();
  });
  [fFrom, fTo, fExp].forEach(function (el) { el.addEventListener('change', render); });
  $('bAll').onclick = function () { visible().forEach(function (p) { p.on = true; }); render(); };
  $('bNone').onclick = function () { visible().forEach(function (p) { p.on = false; }); render(); };

  function scope() {
    var a = fFrom.value, b = fTo.value, e = fExp.value, t = [];
    if (e) t.push(EXP[e]);
    if (+a && +b < 9999) t.push(a === b ? a : a + ' - ' + b); else if (+a) t.push('depuis ' + a); else if (+b < 9999) t.push("jusqu'en " + b);
    return t.join(' · ');
  }
  var today = function () { return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); };
  var stamp = function () { return new Date().toISOString().slice(0, 10); };

  var COVER_CSS = '.cover{position:relative;width:297mm;height:210mm;padding:14mm 16mm 12mm;display:flex;flex-direction:column;background:#fff;color:#2b2825;font-family:var(--font-body);page-break-after:always;break-after:page;overflow:hidden}' +
    '.cover__logo{font-family:"Source Code Pro",monospace;font-weight:600;font-size:30pt;color:#d6433d;line-height:1}' +
    '.cover__sub{font-family:var(--font-mono);font-size:9pt;letter-spacing:.12em;text-transform:uppercase;color:#a8a199;margin-top:4mm}' +
    '.cover__main{margin-top:auto;border-top:.5pt solid #ddd8d3;padding-top:9mm}' +
    '.cover__title{font-family:var(--font-display);font-weight:600;font-size:46pt;line-height:1;letter-spacing:-.03em;color:#141416;margin:0;max-width:20ch;text-wrap:balance}' +
    '.cover__title .b{color:#d6433d}' +
    '.cover__scope{font-family:var(--font-mono);font-size:10pt;color:#6b655f;margin-top:6mm}' +
    '.cover__foot{margin-top:14mm;display:flex;justify-content:space-between;gap:8mm;font-family:var(--font-mono);font-size:8.5pt;color:#6b655f;border-top:.5pt solid #ddd8d3;padding-top:4mm}';
  var TABLE_CSS = '.tab{width:297mm;min-height:210mm;padding:11mm 12mm;background:#fff;color:#2b2825;font-family:var(--font-body)}' +
    '.tab__top{display:flex;justify-content:space-between;align-items:baseline;gap:8mm;padding-bottom:4mm;border-bottom:.5pt solid #ddd8d3}' +
    '.tab__logo{font-family:"Source Code Pro",monospace;font-weight:600;font-size:17pt;color:#d6433d}' +
    '.tab__h{font-family:var(--font-display);font-weight:600;font-size:16pt;letter-spacing:-.02em;color:#141416;margin:6mm 0 1mm}' +
    '.tab__scope{font-family:var(--font-mono);font-size:8pt;color:#a8a199;margin-bottom:5mm}' +
    'table{width:100%;border-collapse:collapse}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}' +
    'th{font-family:var(--font-mono);font-weight:400;font-size:6.8pt;letter-spacing:.1em;text-transform:uppercase;color:#d6433d;text-align:left;padding:2.2mm 2mm;border-bottom:.75pt solid #141416}' +
    'td{font-size:8.2pt;line-height:1.35;padding:2.4mm 2mm;border-bottom:.5pt solid #e6e1dc;vertical-align:top}' +
    'td.c{font-weight:600;color:#141416}td.n{white-space:nowrap}td.l a{color:#d6433d;text-decoration:none;font-family:var(--font-mono);font-size:7pt;word-break:break-all}' +
    '@page{size:A4 landscape;margin:0}@media screen{.tab{margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.4)}}';

  function coverHTML(list) {
    var t = esc($('fCover').value.trim() || 'Références').replace(/\[([^\]]+)\]/g, '<span class="b">[$1]</span>');
    var s = scope();
    return '<section class="cover"><div class="cover__logo">fair[e]ici!</div><div class="cover__sub">Développement territorial</div>' +
      '<div class="cover__main"><h1 class="cover__title">' + t + '</h1><div class="cover__scope">' + list.length + ' référence' + (list.length > 1 ? 's' : '') + (s ? ' · ' + esc(s) : '') + ' · ' + today() + '</div></div>' +
      '<div class="cover__foot"><span>' + esc(SITE.email || '') + '</span><span>' + esc(SITE.tel || '') + '</span><span>' + esc(base.replace(/^https?:\/\//, '')) + '</span></div></section>';
  }
  function slideHTML(p) {
    var rich = function (h) { return String(h || '').replace(/<ul>/g, '<ul class="slide__steps">'); };
    var sec = function (t, h) { return h ? '<div class="slide__sec slide__rich"><h4>' + esc(t) + '</h4>' + rich(h) + '</div>' : ''; };
    var cell = function (k, v) { return v ? '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>' : ''; };
    return '<section class="slide"><div class="slide__top"><span class="slide__logo">fair[e]ici!</span></div>' +
      '<div class="slide__band"><dl class="slide__meta">' + cell('Année', p.annee) + cell('Budget', p.budget) + cell('Contact client', p.contactClient) + cell('Localité', p.localite) + '</dl>' +
      '<div class="slide__head"><div class="slide__client">' + esc(p.client) + '</div><h3 class="slide__title">' + esc(p.titre) + '</h3>' +
      (p.partenaires ? '<div class="slide__partners">En partenariat avec ' + esc(p.partenaires) + '</div>' : '') + '</div></div>' +
      '<div class="slide__body"><div class="slide__left"><div class="slide__media" style="background-image:url(\'' + p.image + '\')"></div></div>' +
      '<div class="slide__cols">' + sec('Contexte & Objectifs', p.contexteHTML) + sec('Méthodologie', p.methodoHTML) + '</div></div>' +
      '<div class="slide__foot"><span class="bk">fair[e]ici</span><span>Réalisations · Développement territorial</span></div></section>';
  }
  function tableHTML(list) {
    var s = scope();
    return '<section class="tab"><div class="tab__top"><span class="tab__logo">fair[e]ici!</span><span class="tab__scope" style="margin:0">' + today() + '</span></div>' +
      '<h1 class="tab__h">' + esc($('fCover').value.trim() || 'Références') + '</h1><div class="tab__scope">' + list.length + ' référence' + (list.length > 1 ? 's' : '') + (s ? ' · ' + esc(s) : '') + '</div>' +
      '<table><thead><tr><th>Année</th><th>Client</th><th>Mission</th><th>Lieu</th><th>Expertises</th><th>Montant</th><th>Lien</th></tr></thead><tbody>' +
      list.map(function (p) {
        return '<tr><td class="n">' + esc(p.annee) + '</td><td class="c">' + esc(p.client) + '</td><td>' + esc(p.titre) + '</td><td>' + esc(p.localite) + '</td><td>' + esc(p.exNames.join(', ')) + '</td><td class="n">' + esc(p.budget) + '</td>' +
          '<td class="l"><a href="' + esc(p.lien) + '">' + esc(p.lien.replace(/^https?:\/\/(www\.)?/, '')) + '</a></td></tr>';
      }).join('') + '</tbody></table></section>';
  }
  function printDoc(title, css, body) {
    var w = window.open('', '_blank');
    if (!w) { alert("Autorisez l'ouverture des fenêtres pop-up pour ce site, puis recommencez."); return; }
    w.document.write('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>' + esc(title) + '</title><base href="' + location.origin + '/">' +
      '<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@600&family=Space+Grotesk:wght@500;600&family=Space+Mono&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">' +
      '<style>' + (window.SLIDE_CSS || '') + css + '</style></head><body>' + body + '</body></html>');
    w.document.close();
    var go = function () { setTimeout(function () { w.focus(); w.print(); }, 400); };
    var imgs = [].slice.call(w.document.querySelectorAll('.slide__media')).map(function (el) {
      return new Promise(function (res) { var u = (el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1]; if (!u) return res(); var im = new w.Image(); im.onload = im.onerror = res; im.src = u; });
    });
    Promise.all(imgs.concat([w.document.fonts ? w.document.fonts.ready : null])).then(go, go);
  }
  $('bBook').onclick = function () { var l = chosen(); printDoc('book-faire-ici-' + stamp(), COVER_CSS, coverHTML(l) + l.map(slideHTML).join('')); };
  $('bTab').onclick = function () { var l = chosen(); printDoc('references-faire-ici-' + stamp(), TABLE_CSS, tableHTML(l)); };
  $('bXls').onclick = function () {
    if (!window.XLSX) { alert("Le module Excel n'a pas pu se charger. Vérifiez la connexion et rechargez la page."); return; }
    var l = chosen();
    var data = [['Année', 'Client', 'Titre', 'Lieu', 'Expertises', 'Montant', 'Lien vers la fiche']].concat(l.map(function (p) { return [p.annee, p.client, p.titre, p.localite, p.exNames.join(', '), p.budget, p.lien]; }));
    var ws = XLSX.utils.aoa_to_sheet(data);
    l.forEach(function (p, r) { var c = ws[XLSX.utils.encode_cell({ r: r + 1, c: 6 })]; if (c) c.l = { Target: p.lien }; });
    ws['!cols'] = [{ wch: 12 }, { wch: 34 }, { wch: 60 }, { wch: 22 }, { wch: 36 }, { wch: 16 }, { wch: 56 }];
    ws['!autofilter'] = { ref: 'A1:G' + data.length };
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Références');
    XLSX.writeFile(wb, 'references-faire-ici-' + stamp() + '.xlsx');
  };
  render();
})();
