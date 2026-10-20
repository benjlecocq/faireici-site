const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Mise en forme éditoriale : [mot] → crochets rouges · *mot* → accent · **mot** → gras · fair[e]ici → logo-texte
function fi(s) {
  let t = esc(s).replace(/fair\[e\]ici/g, '\u0001');
  t = t.replace(/\[([^\]\n]+)\]/g, '<span class="bracket">[$1]</span>')
       .replace(/\*\*([^*]+)\*\*/g, '<strong class="fi-strong">$1</strong>')
       .replace(/\*([^*]+)\*/g, '<em>$1</em>')
       .replace(/\u0001/g, '<span class="brand-word">fair[e]ici</span>')
       .replace(/\n/g, '<br>');
  return t;
}
const mdi = require('markdown-it')({ html: false, breaks: true, linkify: false });
const toMd = v => Array.isArray(v) ? v.map(p => (p.phase ? '**' + p.phase + '**\n\n' : '') + (p.etapes || []).map(s => '- ' + s).join('\n')).join('\n\n') : String(v || '');
// Texte collé depuis Word : puces « ▪ • ● » → vraies puces ; « Etape N : » / « Phase N » → titre en gras sur sa ligne
const BUL = '[▪•●◦▫■□➢➤►]', BUL0 = '[▪•●◦▫■□➢➤►–·]';
const tidy = s => String(s || '').replace(/\r/g, '').replace(/\u00a0/g, ' ').replace(/\\([*\-])/g, '$1')
  .replace(new RegExp('\\s+' + BUL + '\\s+', 'g'), '\n- ')
  .replace(new RegExp('^\\s*' + BUL0 + '\\s*', 'gm'), '- ')
  .replace(/\s+((?:[EÉ]tape|Phase)\s*\d+\s*[:\-–])/g, '\n\n$1')
  .replace(/^\s*(?:[-*]\s+)?\**((?:[EÉ]tape|Phase)\s*\d+\s*[:\-–][^\n]*?)\**\s*$/gm, '\n**$1**\n')
  .replace(/([^\n])\n- /g, '$1\n\n- ').replace(/(^- [^\n]*)\n\n(?=- )/gm, '$1\n').replace(/(^- [^\n]*)\n(?!- |\n)/gm, '$1\n\n')
  .replace(/\n{3,}/g, '\n\n').trim();
const rich = v => mdi.render(tidy(toMd(v))).replace(/fair\[e\]ici/g, '<span class="brand-word">fair[e]ici</span>');
const plain = v => toMd(v).replace(/\*\*/g, '').replace(/^\s*[-*]\s+/gm, '');
const paras = s => String(s || '').split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => '<p>' + fi(x) + '</p>').join('');

module.exports = function (cfg) {
  cfg.setNunjucksEnvironmentOptions({ autoescape: true });
  cfg.addPassthroughCopy({ 'src/assets': 'assets', 'src/styles': 'styles', 'src/scripts': 'scripts', 'src/admin': 'admin' });
  cfg.addFilter('fi', fi);
  cfg.addFilter('paras', paras);
  cfg.addFilter('rich', rich);
  cfg.addFilter('amp', s => String(s).replace(/ &amp; /g, ' <span class="amp">&amp;</span> '));
  cfg.addFilter('domain', u => String(u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''));
  cfg.addFilter('json', v => JSON.stringify(v).replace(/</g, '\\u003c'));
  cfg.addFilter('excerpt', (s, n = 158) => { const t = plain(s).split(/\n+/)[0].trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; });
  cfg.addFilter('expMap', list => JSON.stringify(Object.fromEntries(list.map(e => [e.key, e.nom]))));
  const expList = v => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v).filter(x => typeof x === 'string') : (v ? [v] : []));
  cfg.addFilter('projetsJson', list => JSON.stringify(list.map(it => { const d = it.data; return {
    expertise: expList(d.expertises), titre: d.titre || '', slug: d.slug, client: d.client || '', annee: String(d.annee || ''), budget: d.budget || '',
    contactClient: d.contact_client || '', localite: d.localite || '', partenaires: d.partenaires || '', image: d.image || '', pdf: d.pdf || '',
    contexteHTML: d.contexte ? rich(d.contexte) : '', methodoHTML: d.methodo && d.methodo.length ? rich(d.methodo) : ''
  }; })).replace(/</g, '\\u003c'));
  cfg.addCollection('projets', api => api.getFilteredByGlob('src/realisations/*.md').sort((a, b) => (a.data.ordre || 999) - (b.data.ordre || 999)));
  cfg.addGlobalData('annee', new Date().getFullYear());
  return { dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' }, templateFormats: ['njk', 'md'], htmlTemplateEngine: 'njk', markdownTemplateEngine: false };
};
