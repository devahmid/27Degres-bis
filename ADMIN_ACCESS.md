# Guide d'accès à la partie Administration

## 🎯 Comment accéder à l'administration

Pour accéder à la partie admin, vous devez avoir un compte utilisateur avec le rôle `admin`.

### Méthode 1 : Créer un utilisateur admin via le script

1. **Assurez-vous que le backend est configuré** avec votre `DATABASE_URL` dans le fichier `.env`

2. **Exécutez le script de création d'admin** :
   ```bash
   cd backend
   npm run create-admin
   ```

3. **Identifiants par défaut créés** :
   - 📧 Email: `admin@27degres.fr`
   - 🔑 Mot de passe: `admin123`

4. **Connectez-vous** sur le frontend avec ces identifiants

5. **Accédez à l'admin** :
   - Cliquez sur l'icône de profil en haut à droite
   - Sélectionnez "Administration" dans le menu
   - Ou accédez directement à : `http://localhost:4200/admin/dashboard`

### Méthode 2 : Transformer un utilisateur existant en admin

Si vous avez déjà un compte utilisateur, vous pouvez le transformer en admin :

1. **Via la base de données** (PostgreSQL/Supabase) :
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'votre@email.com';
   ```

2. **Via le script** (si l'email existe déjà) :
   ```bash
   cd backend
   npm run create-admin
   ```
   Le script détectera l'utilisateur existant et mettra à jour son rôle.

## 🔐 Routes Admin disponibles

Une fois connecté en tant qu'admin, vous avez accès à :

- `/admin/dashboard` - Tableau de bord administrateur
- `/admin/members` - Gestion des membres
- `/admin/events` - Gestion des événements
- `/admin/posts` - Gestion des actualités
- `/admin/statistics` - Statistiques

## ⚠️ Sécurité

**IMPORTANT** : Changez le mot de passe par défaut après la première connexion !

Pour changer le mot de passe :
1. Connectez-vous avec les identifiants par défaut
2. Allez dans "Mon Profil" (`/member/profile`)
3. Modifiez votre mot de passe

## 🛠️ Dépannage

### Le script ne fonctionne pas

1. Vérifiez que `DATABASE_URL` est bien définie dans `.env`
2. Vérifiez que la base de données est accessible
3. Vérifiez que toutes les dépendances sont installées : `npm install`

### L'option "Administration" n'apparaît pas dans le menu

1. Déconnectez-vous et reconnectez-vous pour rafraîchir le token JWT
2. Vérifiez que votre utilisateur a bien le rôle `admin` dans la base de données
3. Videz le cache du navigateur

### Erreur 403 Forbidden sur les routes admin

1. Vérifiez que votre token JWT contient bien le rôle `admin`
2. Déconnectez-vous et reconnectez-vous
3. Vérifiez que le guard `roleGuard` fonctionne correctement









