# 🔧 Configuration DNS pour l'Email - Guide Complet

## ⚠️ IMPORTANT

**Sans cette configuration DNS, vos emails continueront d'arriver dans les spams**, même avec une configuration backend parfaite.

---

## 📋 Enregistrements DNS à Ajouter

### 1. **SPF (Sender Policy Framework)**

**Type :** TXT  
**Nom :** `@` (ou `27degres-basseville.fr`)  
**Valeur :**
```
v=spf1 mx a:mail.27degres-basseville.fr ip4:VOTRE_IP_SERVEUR ~all
```

**Exemple si vous utilisez uniquement votre serveur mail :**
```
v=spf1 mx a:mail.27degres-basseville.fr ~all
```

**Explication :**
- `v=spf1` : Version SPF
- `mx` : Autoriser les serveurs MX du domaine
- `a:mail.27degres-basseville.fr` : Autoriser l'adresse IP de votre serveur mail
- `~all` : Soft fail pour les autres (changez en `-all` pour hard fail une fois testé)

---

### 2. **DKIM (DomainKeys Identified Mail)**

**Étape 1 : Générer les clés DKIM**

Si votre hébergeur email ne fournit pas les clés DKIM, vous pouvez les générer avec :

```bash
openssl genrsa -out dkim_private.key 1024
openssl rsa -in dkim_private.key -pubout -out dkim_public.key
```

**Étape 2 : Configurer dans votre serveur mail**

Configurez votre serveur mail (cPanel, Plesk, etc.) pour utiliser la clé privée DKIM.

**Étape 3 : Ajouter l'enregistrement DNS**

**Type :** TXT  
**Nom :** `default._domainkey` (ou `selector._domainkey` selon votre config)  
**Valeur :**
```
v=DKIM1; k=rsa; p=VOTRE_CLE_PUBLIQUE_DKIM_ICI
```

**Exemple :**
```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

**Note :** La clé publique peut être très longue (plusieurs lignes). Dans le DNS, vous pouvez la mettre sur une seule ligne ou utiliser des guillemets.

---

### 3. **DMARC (Domain-based Message Authentication)**

**Type :** TXT  
**Nom :** `_dmarc`  
**Valeur (Mode Test - Recommandé pour commencer) :**
```
v=DMARC1; p=none; rua=mailto:noreply@27degres-basseville.fr; ruf=mailto:noreply@27degres-basseville.fr; pct=100; sp=none; aspf=r; adkim=r;
```

**⚠️ IMPORTANT :** Dans l'interface de configuration, remplissez OBLIGATOIREMENT :
- **Send Aggregate Mail Reports To :** `mailto:noreply@27degres-basseville.fr`
- **Send Failure Reports To :** `mailto:noreply@27degres-basseville.fr`

Ces rapports sont essentiels pour comprendre pourquoi vos emails vont dans les spams !

**Valeur (Mode Production - Après tests) :**
```
v=DMARC1; p=quarantine; rua=mailto:noreply@27degres-basseville.fr; ruf=mailto:noreply@27degres-basseville.fr; pct=100; sp=quarantine; aspf=r;
```

**Explication :**
- `v=DMARC1` : Version DMARC
- `p=none` : Ne rien faire si échec (mode test) → Changez en `p=quarantine` puis `p=reject` progressivement
- `rua` : Adresse pour recevoir les rapports agrégés (quotidiens)
- `ruf` : Adresse pour recevoir les rapports de non-conformité
- `pct=100` : Pourcentage d'emails à vérifier (100%)
- `sp=quarantine` : Politique pour les sous-domaines
- `aspf=r` : Alignement SPF relâché

---

## 🎯 Ordre de Configuration Recommandé

1. **SPF** (le plus simple, faites-le en premier)
2. **Attendre 24-48h** pour propagation DNS
3. **Tester SPF** avec https://mxtoolbox.com/spf.aspx
4. **DKIM** (si votre hébergeur le supporte)
5. **Attendre 24-48h** pour propagation DNS
6. **Tester DKIM** avec https://mxtoolbox.com/dkim.aspx
7. **DMARC en mode `p=none`** (test)
8. **Attendre 24-48h** et vérifier les rapports
9. **Passer DMARC en `p=quarantine`** puis `p=reject` progressivement

---

## 🧪 Tests de Vérification

### Test SPF
1. Allez sur : https://mxtoolbox.com/spf.aspx
2. Entrez votre domaine : `27degres-basseville.fr`
3. Vérifiez que le résultat est vert ✅

### Test DKIM
1. Allez sur : https://mxtoolbox.com/dkim.aspx
2. Entrez votre domaine et le sélecteur (généralement `default`)
3. Vérifiez que la clé publique est correcte ✅

### Test DMARC
1. Allez sur : https://mxtoolbox.com/dmarc.aspx
2. Entrez votre domaine : `27degres-basseville.fr`
3. Vérifiez que la politique est correcte ✅

### Test Email Complet
1. Allez sur : https://www.mail-tester.com/
2. Copiez l'adresse email fournie
3. Envoyez un email depuis votre application à cette adresse
4. Cliquez sur "Then check your score"
5. **Objectif : Score ≥ 8/10** ✅

---

## 📍 Où Configurer le DNS ?

### **OVH**
1. Connectez-vous à votre espace client OVH
2. Allez dans "Domaines" → Votre domaine
3. Cliquez sur "Zone DNS"
4. Ajoutez les enregistrements TXT

### **Gandi**
1. Connectez-vous à votre compte Gandi
2. Allez dans "Domaines" → Votre domaine
3. Cliquez sur "Enregistrements DNS"
4. Ajoutez les enregistrements TXT

### **Cloudflare**
1. Connectez-vous à Cloudflare
2. Sélectionnez votre domaine
3. Allez dans "DNS" → "Records"
4. Ajoutez les enregistrements TXT

### **Autre Hébergeur**
Contactez le support de votre hébergeur et demandez :
- "Je veux ajouter des enregistrements TXT pour SPF, DKIM et DMARC"
- Ils vous guideront dans leur interface

---

## ⚠️ Erreurs Courantes

1. **Plusieurs enregistrements SPF** : Vous ne pouvez avoir QU'UN SEUL enregistrement SPF. Si vous en avez plusieurs, fusionnez-les.

2. **DKIM non configuré côté serveur** : Le DNS seul ne suffit pas, il faut aussi configurer le serveur mail pour signer les emails.

3. **Propagation DNS** : Les changements DNS peuvent prendre jusqu'à 48h. Soyez patient.

4. **Syntaxe incorrecte** : Vérifiez bien la syntaxe, un espace ou caractère manquant peut tout casser.

---

## 📞 Besoin d'Aide ?

Si vous avez des difficultés :
1. Contactez votre hébergeur email (ils connaissent généralement bien ces configurations)
2. Utilisez les outils de test mentionnés ci-dessus
3. Vérifiez les logs de votre serveur mail pour les erreurs DKIM

---

*Dernière mise à jour : Janvier 2026*
