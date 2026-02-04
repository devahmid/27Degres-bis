# 🔧 Correction du Problème d'Email dans les Spams

## 🔴 Problème Identifié

**Incohérence de domaine dans la configuration email :**

- ✅ `SMTP_USER=noreply@27degres-basseville.fr` (correct)
- ❌ `SMTP_FROM=noreply@27degres.fr` (domaine différent !)

**Conséquence :**
- Les emails sont envoyés depuis le serveur `27degres-basseville.fr`
- Mais l'adresse "From" indique `27degres.fr` (domaine différent)
- Les filtres anti-spam détectent cette incohérence et classent les emails en spam
- L'en-tête "via" apparaît car le domaine d'envoi ne correspond pas au domaine "From"

---

## ✅ Solution Appliquée

### 1. Correction du fichier `.env`

**Avant :**
```env
SMTP_USER=noreply@27degres-basseville.fr
SMTP_FROM=noreply@27degres.fr  ❌
```

**Après :**
```env
SMTP_USER=noreply@27degres-basseville.fr
SMTP_FROM=noreply@27degres-basseville.fr  ✅
```

### 2. Correction du code backend

Le code utilise maintenant **toujours** `SMTP_USER` comme adresse d'envoi pour garantir la cohérence, même si `SMTP_FROM` est défini différemment.

---

## 📋 Règle d'Or pour l'Email

**L'adresse "From" DOIT toujours correspondre au domaine du serveur SMTP utilisé.**

Si vous utilisez :
- Serveur SMTP : `mail.27degres-basseville.fr`
- Utilisateur SMTP : `noreply@27degres-basseville.fr`

Alors l'adresse "From" DOIT être : `noreply@27degres-basseville.fr`

---

## 🧪 Test Après Correction

1. **Redémarrez le serveur backend** pour appliquer les changements
2. **Envoyez un email de test** depuis votre application
3. **Vérifiez l'en-tête de l'email reçu** :
   - Il devrait maintenant afficher : `Association 27 Degrés <noreply@27degres-basseville.fr>`
   - **SANS** le "via" suspect
4. **Testez avec mail-tester.com** : https://www.mail-tester.com/
   - Objectif : Score ≥ 8/10

---

## ⚠️ Important

**Si vous avez configuré SPF/DKIM/DMARC pour `27degres-basseville.fr`**, cette correction est essentielle car :
- SPF vérifie que l'IP d'envoi est autorisée pour le domaine "From"
- DKIM signe les emails avec la clé du domaine "From"
- DMARC vérifie que SPF et DKIM correspondent au domaine "From"

Avec un domaine "From" différent (`27degres.fr`), ces vérifications échouent, ce qui explique pourquoi les emails vont dans les spams.

---

## 🔄 Si Vous Voulez Utiliser `noreply@27degres.fr`

Si vous souhaitez vraiment utiliser `noreply@27degres.fr` comme adresse d'envoi, vous devez :

1. **Configurer un serveur SMTP pour `27degres.fr`**
2. **Configurer SPF/DKIM/DMARC pour `27degres.fr`**
3. **Utiliser ce serveur SMTP dans votre application**

**Mais la solution la plus simple est d'utiliser `noreply@27degres-basseville.fr` partout**, ce qui est maintenant le cas.

---

*Dernière mise à jour : Février 2026*
