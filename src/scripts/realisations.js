/* fair[e]ici - RÉALISATIONS
   Les données (window.PROJETS, window.EXPERTISES) sont générées à partir du
   back office (/admin). Ne pas modifier les références ici. */
var EXPERTISES = window.EXPERTISES || {};
if (!Object.keys(EXPERTISES).length) EXPERTISES = {'diversification':'Résilience économique','offre-accueil':'Offre d\'accueil territoriale','attractivite':'Attractivité territoriale','programmation':'Programmation','ess':'Entrepreneuriat & ESS'};
var PROJETS = window.PROJETS || [];

/* ------------------------------------------------------------------------- */
/* CSS du book (onglet d'impression autonome) - A4 paysage, 1 réf. / page */
var SLIDE_CSS = `
:root{--font-display:'Space Grotesk',system-ui,sans-serif;--font-body:'Hanken Grotesk',system-ui,sans-serif;--font-mono:'Space Mono',ui-monospace,monospace;}
@page{size:A4 landscape;margin:0;}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.slide{position:relative;width:297mm;height:210mm;box-sizing:border-box;margin:0 auto;padding:11mm 14mm 9mm;page-break-after:always;break-after:page;overflow:hidden;background:#fff;color:#2b2825;display:flex;flex-direction:column;font-family:var(--font-body);}
.slide:last-child{page-break-after:auto;break-after:auto;}
.slide__top{display:flex;align-items:center;padding-bottom:4mm;border-bottom:0.5pt solid #ddd8d3;flex:none;}
.slide__logo{font-family:'Source Code Pro',ui-monospace,monospace;font-weight:600;font-size:17pt;color:#d6433d;line-height:1;letter-spacing:-0.01em;}
.slide__band{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:12mm;margin-top:6mm;align-items:stretch;flex:none;}
.slide__meta{display:grid;grid-template-columns:1fr 1fr;gap:4mm 8mm;align-content:start;padding-bottom:4mm;border-bottom:0.5pt solid #ddd8d3;}
.slide__meta dt{font-family:var(--font-mono);font-size:6.5pt;letter-spacing:0.1em;text-transform:uppercase;color:#a8a199;}
.slide__meta dd{margin:1.5mm 0 0;font-family:var(--font-mono);font-size:8.5pt;color:#2b2825;}
.slide__head{padding-bottom:4mm;border-bottom:0.5pt solid #ddd8d3;}
.slide__client{font-family:var(--font-mono);font-size:8pt;color:#6b655f;}
.slide__title{font-family:var(--font-display);font-weight:600;font-size:16pt;line-height:1.1;letter-spacing:-0.02em;color:#141416;margin:2.5mm 0 0;text-wrap:balance;}
.slide__partners{font-family:var(--font-mono);font-size:7.5pt;color:#a8a199;margin-top:2mm;}
.slide__body{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:12mm;margin-top:6mm;flex:1 1 auto;align-items:stretch;min-height:0;}
.slide__left{position:relative;min-height:0;}
.slide__media{position:absolute;left:0;right:0;top:0;bottom:5mm;border-radius:1.5mm;overflow:hidden;box-shadow:0 0 0 0.75pt #e2ddd8;background-size:cover;background-position:center;background-repeat:no-repeat;}
.slide__cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8mm;align-content:start;min-height:0;}
.slide__sec{break-inside:avoid;}
.slide__sec h4{font-family:var(--font-mono);font-weight:400;font-size:7pt;letter-spacing:0.12em;text-transform:uppercase;color:#d6433d;margin:0 0 3mm;}
.slide__sec p{font-size:8.5pt;line-height:1.45;color:#3f3a35;margin:0 0 2mm;}
.slide__steps{margin:0;padding:0;list-style:none;}
.slide__steps li{position:relative;padding-left:3.6mm;font-size:8.5pt;line-height:1.4;color:#3f3a35;margin-bottom:1.4mm;break-inside:avoid;}
.slide__steps li::before{content:"";position:absolute;left:0;top:1.5mm;width:1.2mm;height:1.2mm;border-radius:50%;background:#d6433d;}
.slide__phase{font-family:var(--font-body);font-weight:600;font-size:8.5pt;color:#141416;margin:3mm 0 1.6mm;break-after:avoid;}
.slide__phase:first-child{margin-top:0;}
.slide__rich strong{color:#141416;font-weight:600;}
.slide__rich li p{margin:0;font-size:inherit;}
.slide__foot{flex:none;margin-top:auto;padding-top:4mm;border-top:0.5pt solid #ddd8d3;display:flex;justify-content:space-between;align-items:baseline;font-family:var(--font-mono);font-size:7pt;letter-spacing:0.04em;color:#a8a199;}
.slide__foot .bk{color:#d6433d;}
@media screen{body{background:#555;padding:18px 0;}.slide{box-shadow:0 10px 40px rgba(0,0,0,.4);margin-bottom:18px;}}
`;

/* ------------------------------------------------------------------------- */
(function () {
  'use strict';
  var grid = document.getElementById('grid');
  var filtersWrap = document.getElementById('filters');
  var emptyMsg = document.getElementById('empty');
  var modal = document.getElementById('modal');
  var modalPanel = document.getElementById('modalPanel');
  if (!grid) return;

  var current = 'all';
  try { var qf = new URLSearchParams(location.search).get('f'); if (qf && EXPERTISES[qf]) current = qf; } catch (e) {}
  var bookMode = false;
  var selected = [];   // array of project indices, in selection order

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* expertise peut être une chaîne OU un tableau de clés */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function toKey(v) {
    var n = norm(v);
    for (var k in EXPERTISES) { if (k === n || norm(EXPERTISES[k]) === n) return k; }
    return n;
  }
  function expKeys(p) {
    var v = p.expertise;
    if (typeof v === 'string') v = v.split(/[,;]/);
    if (Object.prototype.toString.call(v) !== '[object Array]') v = [];
    return v.map(toKey).filter(Boolean);
  }
  function hasExp(p, key) { return expKeys(p).indexOf(key) !== -1; }
  function expLabel(p) {
    if (p.categorie) return p.categorie;
    return expKeys(p).map(function (k) { return EXPERTISES[k] || k; }).join(' · ');
  }

  /* ---- filters ---- */
  function buildFilters() {
    var cats = [['all', 'Tout voir']].concat(Object.keys(EXPERTISES).map(function (k) { return [k, EXPERTISES[k]]; }));
    filtersWrap.innerHTML = cats.map(function (c) {
      var key = c[0], label = c[1];
      var count = key === 'all' ? PROJETS.length : PROJETS.filter(function (p) { return hasExp(p, key); }).length;
      return '<button class="filter" data-cat="' + key + '" aria-pressed="' + (key === current) + '">' +
             esc(label) + '<span class="count">' + count + '</span></button>';
    }).join('');
    filtersWrap.querySelectorAll('.filter').forEach(function (b) {
      b.addEventListener('click', function () {
        current = b.getAttribute('data-cat');
        filtersWrap.querySelectorAll('.filter').forEach(function (x) {
          x.setAttribute('aria-pressed', x.getAttribute('data-cat') === current);
        });
        try { history.replaceState(null, '', current === 'all' ? location.pathname : '?f=' + current); } catch (e) {}
        render();
      });
    });
  }

  /* ---- grid ---- */
  function render() {
    var list = current === 'all' ? PROJETS : PROJETS.filter(function (p) { return hasExp(p, current); });
    emptyMsg.hidden = list.length > 0;
    grid.innerHTML = list.map(function (p) {
      var idx = PROJETS.indexOf(p);
      var isSel = selected.indexOf(idx) !== -1;
      return '<a class="card' + (isSel ? ' selected' : '') + '" href="/realisations/' + p.slug + '.html" data-idx="' + idx + '" aria-label="' + esc(p.titre) + '">' +
        '<img src="' + p.image + '" alt="' + esc(p.titre) + '" loading="lazy">' +
        '<span class="card__check">✓</span>' +
        '<span class="card__arrow"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.5"><path d="M3 13L13 3M13 3H5M13 3V11"/></svg></span>' +
        '<span class="card__body">' +
          '<span class="card__title">' + esc(p.titre) + '</span>' +
          '<span class="card__client">' + esc(p.client) + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
    grid.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('click', function (e) {
        // In book mode the card is a selection checkbox, not a link.
        if (bookMode) {
          e.preventDefault();
          toggleSelect(+c.getAttribute('data-idx'), c);
        }
        // Otherwise let the browser follow the href to the reference page.
      });
    });
  }

  /* ---- modal ---- */
  /* contexteHTML / methodoHTML : HTML déjà généré (gras + puces) au build */
  function richHTML(h, listClass) { return String(h || '').replace(/<ul>/g, '<ul class="' + listClass + '">'); }
  function openModal(idx) {
    var p = PROJETS[idx];
    if (!p) return;
    modalPanel.innerHTML =
      '<div class="modal__media"><img src="' + p.image + '" alt="' + esc(p.titre) + '"></div>' +
      '<div class="modal__inner">' +
        '<p class="modal__client">' + esc(p.client) + '</p>' +
        '<h2 class="modal__title">' + esc(p.titre) + '</h2>' +
        (p.partenaires ? '<p class="modal__partners">En partenariat avec ' + esc(p.partenaires) + '</p>' : '') +
        '<div class="modal__meta">' +
          metaCell('Année', p.annee) +
          metaCell('Budget', p.budget) +
          metaCell('Contact client', p.contactClient) +
          metaCell('Localité', p.localite) +
        '</div>' +
        (p.contexteHTML ? '<div class="modal__section modal__rich"><h3>Contexte &amp; Objectifs</h3>' + richHTML(p.contexteHTML, 'modal__steps') + '</div>' : '') +
        (p.methodoHTML ? '<div class="modal__section modal__rich"><h3>Méthodologie</h3>' + richHTML(p.methodoHTML, 'modal__steps') + '</div>' : '') +
      '</div>';
    modalPanel.scrollTop = 0;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.setAttribute('data-modal', 'open');
  }
  function metaCell(k, v) { return v ? '<dl><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></dl>' : ''; }
  function section(t, body) { return body ? '<div class="modal__section"><h3>' + esc(t) + '</h3><p>' + esc(body) + '</p></div>' : ''; }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.removeAttribute('data-modal');
  }
  modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---- book mode: selection + PDF ---- */
  var bookToggle = document.getElementById('bookToggle');
  var bookbar = document.getElementById('bookbar');
  var bookCount = document.getElementById('bookCount');
  var bookClear = document.getElementById('bookClear');
  var bookGen = document.getElementById('bookGen');
  var bookOut = document.getElementById('bookOut');

  function toggleSelect(idx, cardEl) {
    var pos = selected.indexOf(idx);
    if (pos === -1) { selected.push(idx); cardEl && cardEl.classList.add('selected'); }
    else { selected.splice(pos, 1); cardEl && cardEl.classList.remove('selected'); }
    updateBar();
  }
  function updateBar() {
    bookCount.textContent = selected.length;
    bookGen.disabled = selected.length === 0;
  }
  function setBookMode(on) {
    bookMode = on;
    document.body.setAttribute('data-book', on ? 'on' : 'off');
    bookToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    bookbar.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (!on) { selected = []; render(); updateBar(); }
  }
  bookToggle.addEventListener('click', function () { setBookMode(!bookMode); });
  bookClear.addEventListener('click', function () {
    selected = [];
    grid.querySelectorAll('.card.selected').forEach(function (c) { c.classList.remove('selected'); });
    updateBar();
  });

  function buildSlides() {
    bookOut.innerHTML = selected.map(function (idx) {
      var p = PROJETS[idx];
      function sec(t, h){ return h ? '<div class="slide__sec slide__rich"><h4>' + esc(t) + '</h4>' + richHTML(h, 'slide__steps') + '</div>' : ''; }
      function cell(k, v){ return v ? '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>' : ''; }
      return '<section class="slide">' +
        '<div class="slide__top">' +
          '<span class="slide__logo">fair[e]ici!</span>' +
        '</div>' +
        '<div class="slide__band">' +
          '<dl class="slide__meta">' +
            cell('Année', p.annee) + cell('Budget', p.budget) +
            cell('Contact client', p.contactClient) + cell('Localité', p.localite) +
          '</dl>' +
          '<div class="slide__head">' +
            '<div class="slide__client">' + esc(p.client) + '</div>' +
            '<h3 class="slide__title">' + esc(p.titre) + '</h3>' +
            (p.partenaires ? '<div class="slide__partners">En partenariat avec ' + esc(p.partenaires) + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="slide__body">' +
          '<div class="slide__left"><div class="slide__media" style="background-image:url(\'' + p.image + '\')"></div></div>' +
          '<div class="slide__cols">' +
            sec('Contexte & Objectifs', p.contexteHTML) + sec('Méthodologie', p.methodoHTML) +
          '</div>' +
        '</div>' +
        '<div class="slide__foot"><span class="bk">fair[e]ici</span><span>Réalisations · Développement territorial</span></div>' +
      '</section>';
    }).join('');
  }
  bookGen.addEventListener('click', function () {
    if (!selected.length) return;
    generatePDF();
  });

  /* One-click PDF export - A4 landscape, one reference per page.
     Renders slides in an off-screen container of the MAIN document (book CSS
     prefixed so it can't affect the page), rasterises each with html2canvas,
     and assembles a downloadable PDF with jsPDF. No print dialog, guaranteed
     landscape. Falls back to a print tab if the libraries are unavailable. */
  var bookStyleEl = null;
  function ensureBookStyle() {
    if (bookStyleEl) return;
    // prefix every rule of SLIDE_CSS with #__bookrender, and drop @page/@media
    var scoped = SLIDE_CSS
      .replace(/@page\s*\{[^}]*\}/g, '')
      .replace(/@media[^{]*\{[\s\S]*?\}\s*\}/g, '')
      .replace(/(^|\})\s*([^{}@]+)\{/g, function (m, brace, sel) {
        var sels = sel.split(',').map(function (s) {
          s = s.trim(); if (!s) return s;
          if (/^(html|body)\b/.test(s)) return '#__bookrender';
          return '#__bookrender ' + s;
        }).join(',');
        return brace + ' ' + sels + '{';
      });
    bookStyleEl = document.createElement('style');
    bookStyleEl.textContent = scoped;
    document.head.appendChild(bookStyleEl);
  }

  function generatePDF() {
    if (typeof html2canvas === 'undefined' || !window.jspdf) { openBookWindow(buildSlidesHTML()); return; }
    var prevLabel = bookGen.innerHTML;
    bookGen.disabled = true;
    bookGen.innerHTML = 'Génération du PDF…';

    ensureBookStyle();
    var holder = document.createElement('div');
    holder.id = '__bookrender';
    holder.style.cssText = 'position:fixed;left:-12000px;top:0;width:1123px;background:#fff;z-index:-1;';
    holder.innerHTML = buildSlidesHTML();
    document.body.appendChild(holder);

    setTimeout(function () {
      var slides = [].slice.call(holder.querySelectorAll('.slide'));
      var pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      var seq = Promise.resolve();
      slides.forEach(function (slideEl, i) {
        seq = seq.then(function () {
          return html2canvas(slideEl, { scale: 3.5, useCORS: true, backgroundColor: '#ffffff', width: 1123, height: 794, windowWidth: 1123, windowHeight: 794 });
        }).then(function (canvas) {
          var img = canvas.toDataURL('image/jpeg', 0.96);
          if (i > 0) pdf.addPage('a4', 'landscape');
          pdf.addImage(img, 'JPEG', 0, 0, 297, 210);
        });
      });
      seq.then(function () {
        pdf.save('book-faire-ici.pdf');
      }).catch(function () {
        openBookWindow(buildSlidesHTML());
      }).then(function () {
        holder.remove();
        bookGen.disabled = false;
        bookGen.innerHTML = prevLabel;
      });
    }, 700);
  }

  function buildSlidesHTML() { buildSlides(); return bookOut.innerHTML; }

  /* Fallback: open the slides in a standalone tab (used only if the PDF
     libraries fail to load or a capture error occurs). */
  function openBookWindow(slidesHTML) {
    var w = window.open('', '_blank');
    if (!w) { window.print(); return; }
    var doc = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">' +
      '<title>Book - fair[e]ici</title>' +
      '<base href="' + location.href + '">' +
      '<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200..900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Hanken+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">' +
      '<style>' + SLIDE_CSS + '</style></head><body>' + slidesHTML +
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},350);});<\/script>' +
      '</body></html>';
    w.document.open(); w.document.write(doc); w.document.close();
  }

  buildFilters();
  render();
  updateBar();
})();
