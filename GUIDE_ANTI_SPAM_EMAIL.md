# 📧 Guide Anti-Spam - Configuration Email

## 🔴 Problème Actuel

Les emails envoyés depuis l'application arrivent dans les spams des destinataires.

## ✅ Solutions à Mettre en Place

### 1. **Configuration DNS (OBLIGATOIRE)** ⚠️

Pour éviter les spams, vous **DEVEZ** configurer les enregistrements DNS suivants pour votre domaine `27degres-basseville.fr` :

#### **A. SPF (Sender Policy Framework)**

Ajoutez cet enregistrement TXT dans votre DNS :

```
Type: TXT
Nom: @ (ou 27degres-basseville.fr)
Valeur: v=spf1 mx a:mail.27degres-basseville.fr ip4:VOTRE_IP_SERVEUR ~all
```

**Exemple complet :**
```
v=spf1 mx a:mail.27degres-basseville.fr include:mail.27degres-basseville.fr ~all
```

#### **B. DKIM (DomainKeys Identified Mail)**

1. **Générer les clés DKIM** (demandez à votre hébergeur email ou utilisez un générateur)
2. **Ajouter l'enregistrement DNS** :

```
Type: TXT
Nom: default._domainkey (ou selector._domainkey)
Valeur: v=DKIM1; k=rsa; p=VOTRE_CLE_PUBLIQUE_DKIM
```

#### **C. DMARC (Domain-based Message Authentication)**

Ajoutez cet enregistrement TXT :

```
Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=quarantine; rua=mailto:noreply@27degres-basseville.fr; ruf=mailto:noreply@27degres-basseville.fr; pct=100
```

**Explication :**
- `p=quarantine` : Mettre en quarantaine les emails non authentifiés (changez en `p=none` pour commencer en mode test)
- `rua` : Adresse pour recevoir les rapports agrégés
- `ruf` : Adresse pour recevoir les rapports de non-conformité

### 2. **Amélioration de la Configuration Backend**

J'ai amélioré la configuration du module mail pour ajouter :
- Headers d'authentification
- Headers anti-spam
- Configuration TLS/SSL correcte
- Reply-To approprié

### 3. **Amélioration du Contenu des Emails**

- Éviter les mots déclencheurs de spam
- Ajouter un lien de désinscription
- Structurer correctement le HTML
- Éviter les images suspectes

### 4. **Vérification de la Réputation**

- Vérifier votre IP sur : https://mxtoolbox.com/blacklists.aspx
- Vérifier votre domaine sur : https://www.mail-tester.com/

---

## 📋 Checklist de Configuration

- [ ] SPF configuré dans le DNS
- [ ] DKIM configuré dans le DNS
- [ ] DMARC configuré dans le DNS
- [ ] Configuration SMTP avec TLS/SSL correcte
- [ ] Headers d'authentification ajoutés
- [ ] Test d'envoi réussi
- [ ] Vérification avec mail-tester.com (score > 8/10)

---

## 🔧 Où Configurer le DNS ?

Selon votre hébergeur :
- **OVH** : Espace client → Domaine → Zone DNS
- **Gandi** : Gestionnaire de DNS
- **Cloudflare** : Dashboard → DNS
- **Autre** : Contactez votre hébergeur

---

## 🧪 Test de Configuration

1. **Test SPF** : https://mxtoolbox.com/spf.aspx
2. **Test DKIM** : https://mxtoolbox.com/dkim.aspx
3. **Test DMARC** : https://mxtoolbox.com/dmarc.aspx
4. **Test Email Complet** : https://www.mail-tester.com/

Envoyez un email à l'adresse fournie par mail-tester.com et vérifiez votre score.

---

## ⚠️ Important

**Sans configuration SPF/DKIM/DMARC, vos emails continueront d'arriver dans les spams**, même avec une configuration backend parfaite. Ces enregistrements DNS sont **obligatoires** pour l'authentification email.

---

*Dernière mise à jour : Janvier 2026*
