# Liste des Cas d'Envoi d'Emails - Association 27 Degrés

## 📧 **EMAILS ACTUELLEMENT IMPLÉMENTÉS**

### ✅ **1. Email de Bienvenue**
- **Quand** : Lors de l'inscription d'un nouveau membre
- **Destinataire** : Le nouveau membre
- **Contenu** : Message de bienvenue, informations de connexion
- **Statut** : ✅ Implémenté
- **Fichier** : `backend/src/auth/auth.service.ts` → `register()`

### ✅ **2. Email de Réinitialisation de Mot de Passe**
- **Quand** : Lorsqu'un utilisateur demande la réinitialisation de son mot de passe
- **Destinataire** : L'utilisateur qui a demandé la réinitialisation
- **Contenu** : Lien de réinitialisation avec token (valide 1 heure)
- **Statut** : ✅ Implémenté
- **Fichier** : `backend/src/auth/auth.service.ts` → `forgotPassword()`

### ✅ **3. Email de Confirmation de Commande**
- **Quand** : Lorsqu'un membre passe une commande dans la boutique
- **Destinataire** : Le membre qui a passé la commande
- **Contenu** : Numéro de commande, montant total, informations de suivi
- **Statut** : ✅ Implémenté
- **Fichier** : `backend/src/orders/orders.service.ts` → `create()`

### ✅ **4. Email de Contact**
- **Quand** : Lorsqu'un visiteur envoie un message via le formulaire de contact
- **Destinataire** : L'administrateur de l'association
- **Contenu** : Nom, email, sujet et message du contact
- **Statut** : ✅ Implémenté
- **Fichier** : `backend/src/contact/contact.service.ts` → `create()`

### ✅ **5. Email de Message aux Membres**
- **Quand** : Lorsqu'un admin/bureau envoie un message à un membre depuis le panneau d'administration
- **Destinataire** : Le membre sélectionné
- **Contenu** : Sujet et message personnalisé
- **Statut** : ✅ Implémenté
- **Fichier** : `backend/src/mail/mail.controller.ts` → `sendMemberMessage()`

---

## ❌ **EMAILS NON IMPLÉMENTÉS (À AJOUTER)**

### 🔴 **6. Email de Confirmation d'Inscription à un Événement**
- **Quand** : Lorsqu'un membre s'inscrit à un événement
- **Destinataire** : Le membre qui s'est inscrit
- **Contenu suggéré** :
  - Titre de l'événement
  - Date et lieu
  - Détails de l'inscription (disponibilité, volontariat)
  - Informations pratiques
  - Lien pour voir les détails de l'événement
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/events/events.service.ts` → `register()`

### 🔴 **7. Email de Notification de Nouvel Événement**
- **Quand** : Lorsqu'un admin crée un nouvel événement publié
- **Destinataire** : Tous les membres actifs (qui ont accepté la newsletter)
- **Contenu suggéré** :
  - Titre et description de l'événement
  - Date et lieu
  - Lien pour s'inscrire
  - Informations importantes
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/events/events.service.ts` → `create()` ou `update()` (si changement de statut vers "published")

### 🔴 **8. Email de Modification d'Événement**
- **Quand** : Lorsqu'un événement auquel le membre est inscrit est modifié
- **Destinataire** : Tous les membres inscrits à cet événement
- **Contenu suggéré** :
  - Informations sur les modifications apportées
  - Nouvelles informations de l'événement
  - Lien pour voir les détails mis à jour
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/events/events.service.ts` → `update()`

### 🔴 **9. Email d'Annulation d'Événement**
- **Quand** : Lorsqu'un événement auquel le membre est inscrit est annulé
- **Destinataire** : Tous les membres inscrits à cet événement
- **Contenu suggéré** :
  - Titre de l'événement annulé
  - Date prévue
  - Raison de l'annulation (si fournie)
  - Informations sur les remboursements éventuels
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/events/events.service.ts` → `update()` (si changement de statut vers "cancelled")

### 🔴 **10. Email de Désinscription d'un Événement**
- **Quand** : Lorsqu'un membre se désinscrit d'un événement
- **Destinataire** : Le membre qui s'est désinscrit
- **Contenu suggéré** :
  - Confirmation de désinscription
  - Titre de l'événement
  - Date de l'événement
  - Possibilité de se réinscrire si places disponibles
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/events/events.service.ts` → `unregister()`

### 🔴 **11. Email de Rappel d'Événement**
- **Quand** : X jours avant un événement (ex: 3 jours avant)
- **Destinataire** : Tous les membres inscrits à l'événement
- **Contenu suggéré** :
  - Titre de l'événement
  - Date et heure
  - Lieu
  - Informations pratiques (ce qu'il faut apporter, etc.)
  - Lien pour voir les détails
- **Statut** : ❌ Non implémenté
- **Fichier à créer** : Tâche cron/scheduled task

### 🔴 **12. Email de Confirmation de Cotisation**
- **Quand** : Lorsqu'un membre paie sa cotisation
- **Destinataire** : Le membre qui a payé
- **Contenu suggéré** :
  - Montant payé
  - Période de cotisation
  - Numéro de transaction
  - Reçu en pièce jointe (PDF)
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/cotisations/cotisations.service.ts` → `create()` ou lors du paiement

### 🔴 **13. Email de Rappel de Cotisation**
- **Quand** : Lorsqu'une cotisation est en retard ou approche de l'échéance
- **Destinataire** : Le membre concerné
- **Contenu suggéré** :
  - Montant dû
  - Date d'échéance
  - Lien pour payer en ligne
  - Conséquences du non-paiement
- **Statut** : ❌ Non implémenté
- **Fichier à créer** : Tâche cron/scheduled task

### 🔴 **14. Email de Nouvelle Actualité**
- **Quand** : Lorsqu'un admin publie une nouvelle actualité
- **Destinataire** : Tous les membres actifs (qui ont accepté la newsletter)
- **Contenu suggéré** :
  - Titre de l'actualité
  - Extrait ou introduction
  - Lien pour lire l'article complet
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/posts/posts.service.ts` → `create()` ou `update()` (si changement de statut vers "published")

### 🔴 **15. Email de Nouvelle Idée dans le Forum**
- **Quand** : Optionnel - lorsqu'une nouvelle idée est proposée dans le forum
- **Destinataire** : Tous les membres actifs (qui ont accepté la newsletter) OU seulement les admins/bureau
- **Contenu suggéré** :
  - Titre de l'idée
  - Catégorie
  - Auteur
  - Lien pour voir et voter
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/ideas/ideas.service.ts` → `create()`

### 🔴 **16. Email de Mise à Jour de Statut d'Idée**
- **Quand** : Lorsqu'une idée change de statut (ex: "validée", "en cours", "réalisée")
- **Destinataire** : L'auteur de l'idée + tous ceux qui ont voté ou commenté
- **Contenu suggéré** :
  - Titre de l'idée
  - Nouveau statut
  - Message personnalisé selon le statut
  - Lien pour voir l'idée
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/ideas/ideas.service.ts` → `update()`

### 🔴 **17. Email de Nouveau Commentaire sur une Idée**
- **Quand** : Optionnel - lorsqu'un commentaire est ajouté à une idée
- **Destinataire** : L'auteur de l'idée + tous ceux qui ont commenté
- **Contenu suggéré** :
  - Titre de l'idée
  - Auteur du commentaire
  - Extrait du commentaire
  - Lien pour voir le commentaire complet
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/ideas/ideas.service.ts` → `addComment()`

### 🔴 **18. Email de Nouveau Commentaire sur une Actualité**
- **Quand** : Optionnel - lorsqu'un commentaire est ajouté à une actualité
- **Destinataire** : L'auteur de l'actualité + tous ceux qui ont commenté
- **Contenu suggéré** :
  - Titre de l'actualité
  - Auteur du commentaire
  - Extrait du commentaire
  - Lien pour voir le commentaire complet
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/posts/posts.service.ts` → lors de l'ajout d'un commentaire

### 🔴 **19. Email de Changement de Statut de Commande**
- **Quand** : Lorsqu'une commande change de statut (ex: "expédiée", "livrée", "annulée")
- **Destinataire** : Le membre qui a passé la commande
- **Contenu suggéré** :
  - Numéro de commande
  - Nouveau statut
  - Informations de suivi (si expédiée)
  - Lien pour suivre la commande
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/orders/orders.service.ts` → `updateStatus()`

### 🔴 **20. Email de Notification de Réponse à un Message de Contact**
- **Quand** : Lorsqu'un admin répond à un message de contact
- **Destinataire** : La personne qui a envoyé le message de contact
- **Contenu suggéré** :
  - Sujet du message original
  - Réponse de l'admin
  - Lien pour répondre si nécessaire
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/contact/contact.service.ts` → lors de la réponse

### 🔴 **21. Email de Changement de Rôle**
- **Quand** : Lorsqu'un admin modifie le rôle d'un membre (ex: promotion au bureau)
- **Destinataire** : Le membre concerné
- **Contenu suggéré** :
  - Nouveau rôle
  - Permissions associées
  - Informations sur les nouvelles fonctionnalités accessibles
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/users/users.service.ts` → `update()` (si changement de rôle)

### 🔴 **22. Email de Désactivation de Compte**
- **Quand** : Lorsqu'un admin désactive un compte membre
- **Destinataire** : Le membre concerné
- **Contenu suggéré** :
  - Raison de la désactivation
  - Informations sur la réactivation
  - Contact pour plus d'informations
- **Statut** : ❌ Non implémenté
- **Fichier à modifier** : `backend/src/users/users.service.ts` → `update()` (si isActive = false)

---

## 📊 **RÉSUMÉ**

### Emails Implémentés : **5**
1. ✅ Email de bienvenue
2. ✅ Email de réinitialisation de mot de passe
3. ✅ Email de confirmation de commande
4. ✅ Email de contact (vers admin)
5. ✅ Email de message aux membres

### Emails à Implémenter : **17**
- **Priorité Haute** :
  - Confirmation d'inscription à un événement (#6)
  - Notification de nouvel événement (#7)
  - Confirmation de cotisation (#12)
  
- **Priorité Moyenne** :
  - Modification d'événement (#8)
  - Annulation d'événement (#9)
  - Rappel d'événement (#11)
  - Rappel de cotisation (#13)
  - Nouvelle actualité (#14)
  - Changement de statut de commande (#19)

- **Priorité Basse** :
  - Désinscription d'événement (#10)
  - Nouvelle idée (#15)
  - Mise à jour de statut d'idée (#16)
  - Nouveau commentaire sur idée (#17)
  - Nouveau commentaire sur actualité (#18)
  - Réponse à message de contact (#20)
  - Changement de rôle (#21)
  - Désactivation de compte (#22)

---

## 🔧 **RECOMMANDATIONS D'IMPLÉMENTATION**

1. **Créer un service d'email centralisé** avec des templates réutilisables
2. **Ajouter des préférences utilisateur** pour contrôler quels emails recevoir
3. **Implémenter une file d'attente** pour les emails en masse (ex: notification à tous les membres)
4. **Ajouter des logs** pour tracer l'envoi des emails
5. **Créer des tâches cron** pour les emails automatiques (rappels, etc.)
6. **Ajouter des tests** pour vérifier l'envoi des emails

---

## 📝 **NOTES**

- Tous les emails doivent respecter le consentement newsletter (`consentNewsletter`)
- Les emails transactionnels (confirmation, réinitialisation) doivent être envoyés même sans consentement newsletter
- Les emails promotionnels/informatifs doivent respecter le consentement newsletter
- Considérer l'ajout d'un système de préférences d'email plus granulaire
