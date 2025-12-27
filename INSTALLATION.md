# Guide d'Installation - Association 27 Degrés

## Prérequis

- Node.js 18+ et npm
- PostgreSQL 15+
- Angular CLI 17+ (`npm install -g @angular/cli`)

## Installation

### 1. Base de données PostgreSQL

```bash
# Créer la base de données
createdb asso_27degres

# Ou via psql
psql -U postgres
CREATE DATABASE asso_27degres;
```

### 2. Backend (NestJS)

```bash
cd backend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres de base de données

# Démarrer le serveur de développement
npm run start:dev
```

Le backend sera accessible sur `http://localhost:3000/api`

### 3. Frontend (Angular)

```bash
cd frontend
npm install

# Démarrer le serveur de développement
ng serve
# ou
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## Configuration

### Variables d'environnement Backend (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=asso_27degres

JWT_SECRET=votre_secret_jwt_changez_en_production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:4200

NODE_ENV=development
```

### Variables d'environnement Frontend

Les variables sont dans `frontend/src/environments/environment.ts` pour le développement et `environment.prod.ts` pour la production.

## Structure du Projet

```
27Degres-bis/
├── frontend/          # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services, guards, interceptors
│   │   │   ├── shared/        # Composants réutilisables
│   │   │   └── features/      # Pages et fonctionnalités
│   │   └── environments/      # Configuration
│   └── package.json
│
├── backend/           # API NestJS
│   ├── src/
│   │   ├── auth/              # Authentification
│   │   ├── users/             # Gestion des utilisateurs
│   │   ├── events/            # Événements
│   │   ├── posts/             # Actualités/Blog
│   │   ├── cotisations/       # Cotisations
│   │   ├── documents/         # Documents
│   │   └── contact/           # Contact
│   └── package.json
│
└── cachierDesCharges.md
```

## Premiers Pas

1. **Créer un utilisateur admin** (via SQL ou interface admin une fois créée)
2. **Se connecter** avec les identifiants admin
3. **Créer des événements et actualités** via l'interface admin

## Commandes Utiles

### Backend
- `npm run start:dev` - Démarrage en mode développement
- `npm run build` - Compilation pour la production
- `npm run start:prod` - Démarrage en mode production

### Frontend
- `ng serve` - Démarrage en mode développement
- `ng build` - Compilation pour la production
- `ng test` - Lancer les tests

## Prochaines Étapes

- [ ] Configurer SumUp pour les paiements
- [ ] Configurer l'envoi d'emails (SendGrid/Mailgun)
- [ ] Configurer le stockage d'images (Cloudinary/S3)
- [ ] Déployer sur Vercel (frontend) et Railway (backend)









