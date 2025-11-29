# Association 27 Degrés - Site Web

Site web moderne pour l'Association 27 Degrés - Basse-Ville Génération.

## Structure du Projet

- `frontend/` - Application Angular 17+ avec Angular Material et Tailwind CSS
- `backend/` - API NestJS avec PostgreSQL et TypeORM

## Installation

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application sera accessible sur http://localhost:4200

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm run start:dev
```

L'API sera accessible sur http://localhost:3000/api

## Configuration Base de Données

1. Installer PostgreSQL
2. Créer une base de données : `CREATE DATABASE asso_27degres;`
3. Configurer les variables d'environnement dans `backend/.env`

## Fonctionnalités

- ✅ Authentification (JWT)
- ✅ Gestion des membres
- ✅ Cotisations
- ✅ Événements
- ✅ Actualités/Blog
- ✅ Annuaire des membres
- ✅ Documents
- ✅ Galerie photos
- ✅ Contact

## Technologies

- **Frontend**: Angular 17+, Angular Material, Tailwind CSS
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Auth**: JWT, Passport.js
- **Paiement**: SumUp API (à configurer)

## Développement

Voir le fichier `cachierDesCharges.md` pour les détails complets du projet.

# 27Degres-bis
