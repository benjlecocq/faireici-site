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
const paras = s => String(s || '').split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => '<p>' + fi(x) + '</p>').join('');

module.exports = function (cfg) {
  cfg.setNunjucksEnvironmentOptions({ autoescape: true });
  cfg.addPassthroughCopy({ 'src/assets': 'assets', 'src/styles': 'styles', 'src/scripts': 'scripts', 'src/admin': 'admin' });
  cfg.addFilter('fi', fi);
  cfg.addFilter('paras', paras);
  cfg.addFilter('amp', s => String(s).replace(/ &amp; /g, ' <span class="amp">&amp;</span> '));
  cfg.addFilter('domain', u => String(u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''));
  cfg.addFilter('json', v => JSON.stringify(v).replace(/</g, '\\u003c'));
  cfg.addFilter('excerpt', (s, n = 158) => { const t = String(s || '').split(/\n+/)[0].trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; });
  cfg.addFilter('expMap', list => JSON.stringify(Object.fromEntries(list.map(e => [e.key, e.nom]))));
  cfg.addFilter('projetsJson', list => JSON.stringify(list.map(it => { const d = it.data; return {
    expertise: d.expertises || [], titre: d.titre || '', slug: d.slug, client: d.client || '', annee: String(d.annee || ''), budget: d.budget || '',
    contactClient: d.contact_client || '', localite: d.localite || '', partenaires: d.partenaires || '', image: d.image || '', pdf: d.pdf || '',
    contexteObjectifs: d.contexte || '', methodo: (d.methodo || []).map(p => ({ phase: p.phase || '', items: p.etapes || [] }))
  }; })).replace(/</g, '\\u003c'));
  cfg.addCollection('projets', api => api.getFilteredByGlob('src/realisations/*.md').sort((a, b) => (a.data.ordre || 999) - (b.data.ordre || 999)));
  cfg.addGlobalData('annee', new Date().getFullYear());
  return { dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' }, templateFormats: ['njk', 'md'], htmlTemplateEngine: 'njk', markdownTemplateEngine: false };
};
