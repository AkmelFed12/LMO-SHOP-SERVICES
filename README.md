# LMO SHOP SERVICES

Plateforme e-commerce full stack portfolio, orientee marche ivoirien.

## Fonctionnalites
- Catalogue de plus de 1000 articles en FCFA
- Recherche, filtres, tri par prix/note
- Inscription et connexion client
- Checkout professionnel avec contact client
- Interface admin complete (clients, commandes, revenu en direct)

## Securite et persistance
- Base persistante locale: `data/db.json`
- Mots de passe stockes en hash `scrypt` + sel
- Tokens de session signes (HMAC SHA-256) avec expiration
- Controle d'acces par role pour les routes admin
- Journal d'audit (connexion, inscription, lecture admin, commandes)

## Compte admin par defaut
- ID: `Admin`
- Mot de passe: `Mo74724233`

## Liens
- Portfolio: https://lmoportfolio.vercel.app

## Lancer localement
```bash
npm install
npm run dev
```
