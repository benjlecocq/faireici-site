// Compresse les photos après la fabrication du site : 1600 px de large max, qualité 80.
// Les originaux sur GitHub ne sont pas modifiés.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const dirs = ['_site/assets', '_site/assets/uploads'];
(async () => {
  let n = 0, gain = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f), ext = path.extname(f).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext) || !fs.statSync(p).isFile()) continue;
      const before = fs.statSync(p).size;
      if (before < 300 * 1024) continue;
      try {
        let img = sharp(p, { failOn: 'none' }).rotate().resize({ width: 1600, withoutEnlargement: true });
        img = ext === '.png' ? img.png({ compressionLevel: 9, palette: true }) : img.jpeg({ quality: 80, mozjpeg: true });
        const buf = await img.toBuffer();
        if (buf.length < before) { fs.writeFileSync(p, buf); n++; gain += before - buf.length; }
      } catch (e) { console.warn('Image ignorée :', p, e.message); }
    }
  }
  console.log('Images optimisées :', n, '— gain', Math.round(gain / 1024 / 1024 * 10) / 10, 'Mo');
})();
