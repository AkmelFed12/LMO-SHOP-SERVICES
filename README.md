# Studio Commerce Demo (Portfolio)

Boutique e-commerce fictive full stack, orientee demo portfolio.

## Fonctionnalites
- Catalogue dynamique via API serverless (`/api/products`)
- Recherche, filtre categorie, tri prix/note
- Panier persistant (localStorage)
- Checkout simule avec validation et creation d'ID commande (`/api/checkout`)
- UI responsive premium (desktop + mobile)
- Footer avec signature personnalisee

## Stack
- Frontend: HTML, CSS, JavaScript vanilla
- Backend: Vercel Serverless Functions (Node.js)
- Deploy: Vercel (full stack sur un seul projet)

## Lancer en local
```bash
npm install
npm run dev
```

## Push GitHub
```bash
git init
git add .
git commit -m "feat: portfolio ecommerce full stack"
git branch -M main
git remote add origin <TON_REPO_GITHUB>
git push -u origin main
```

## Deploy Vercel
```bash
vercel --prod
```

## Signature
Footer actuel:
`Signature: Developpe par DELL`

Tu peux remplacer par ton vrai nom/brand dans `public/index.html`.
