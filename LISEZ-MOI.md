# fair[e]ici — site + back office

Ce dossier remplace le dépôt manuel sur Netlify. Une fois installé, toute modification enregistrée dans le back office (`/admin`) met le site à jour automatiquement en 1 à 2 minutes.

## Ce qui se modifie depuis le back office

- **Réalisations** : ajout, modification, suppression, ordre d'affichage, expertises (filtres), image, fiche PDF facultative. La page, la galerie, les filtres, le book PDF et le sitemap se mettent à jour seuls.
- **Pages** : Accueil (dont les photos du carrousel), Conviction, Ressources (associés et partenaires), Contact.
- **Expertises** : les 5 pages. Le nom alimente aussi le menu, l'accueil et les filtres.
- **Coordonnées** : e-mail, téléphone, adresses, adresse du site.

Mise en forme dans les textes : `[mot]` → mot en rouge entre crochets · `*mot*` → en rouge · `**mot**` → gras · `fair[e]ici` s'affiche automatiquement en logo-texte.

---

## Installation (une seule fois, environ 15 minutes)

### 1. GitHub — stocker le site
1. Créer un compte sur github.com (gratuit).
2. **New repository** → nom `faireici-site` → **Private** → Create.
3. Sur la page du dépôt : **uploading an existing file** → glisser **tout le contenu** de ce dossier `backoffice` (sauf `_preview`) → **Commit changes**.
   Astuce : si l'envoi bloque, envoyer d'abord `src/assets`, puis le reste.

### 2. Netlify — relier le site au dépôt
1. Netlify → votre site → **Site configuration → Build & deploy → Continuous deployment → Link repository**.
2. Choisir GitHub → `faireici-site`. Les réglages sont lus automatiquement (`netlify.toml`) : commande `npm run build`, dossier `_site`.
3. **Deploy**. L'adresse du site ne change pas.

### 3. DecapBridge — les identifiants du back office
(Le service de connexion historique de Netlify, « Identity », est obsolète. DecapBridge le remplace gratuitement.)
1. Créer un compte sur decapbridge.com → **Add site**.
2. Renseigner le dépôt `VOTRE-COMPTE/faireici-site` et l'adresse du site. DecapBridge demande un jeton GitHub : suivre leur lien (droits *Contents : read & write* sur ce seul dépôt).
3. DecapBridge affiche un bloc `backend:` à copier. Sur GitHub, ouvrir `src/admin/config.yml` → crayon ✎ → remplacer le bloc `backend:` en haut du fichier (garder les lignes `commit_messages` si vous voulez des messages en français) → **Commit changes**.
4. Dans DecapBridge → **Invite** : saisir l'e-mail des 2–3 personnes. Elles reçoivent une invitation pour créer leur mot de passe.

### 4. Utilisation
Aller sur `https://votre-site/admin` → se connecter → modifier → **Publier**. Le site est à jour 1 à 2 minutes plus tard.

---

## Passage au nom de domaine (faireici.fr / .com)
1. Netlify → **Domain management** → ajouter le domaine.
2. Back office → **Coordonnées** → « Adresse du site » → `https://faireici.fr` → Publier. Les adresses canoniques, Open Graph et le sitemap suivent.
3. Dans `src/admin/config.yml`, mettre à jour `site_url` / `display_url`, et l'adresse du site dans DecapBridge.

## Structure technique (pour un développeur)
- Générateur : Eleventy 2 (`.eleventy.js`), gabarits Nunjucks dans `src/`.
- Contenus : `src/_data/*.json`, `src/_data/expertises/*.json`, `src/realisations/*.md` (front matter).
- Back office : Decap CMS (`src/admin/`), médias envoyés dans `src/assets/uploads/`.
- Test local : `npm install` puis `npm start` (back office local : `npx decap-server` + `http://localhost:8080/admin`).
