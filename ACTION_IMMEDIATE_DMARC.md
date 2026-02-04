# 🚨 Action Immédiate - Configuration DMARC

## ✅ Ce qui est déjà bien configuré

D'après votre capture d'écran, vous avez correctement configuré :
- ✅ **Policy :** "Aucun" (None) - Parfait pour commencer
- ✅ **Subdomain Policy :** "Aucun" (None) - Correct
- ✅ **DKIM Mode :** "Relaxed" - Recommandé
- ✅ **SPF Mode :** "Relaxed" - Recommandé
- ✅ **Percentage :** 100% - Tous les emails sont vérifiés
- ✅ **Report Interval :** 86400 (24h) - Standard

## 🔴 PROBLÈME CRITIQUE À CORRIGER

Les champs suivants sont **VIDES** et doivent être remplis **IMMÉDIATEMENT** :

### 1. **Send Aggregate Mail Reports To** (Rapports agrégés quotidiens)

**Valeur à mettre :**
```
mailto:noreply@27degres-basseville.fr
```

**Pourquoi c'est important :**
- Ces rapports vous indiquent **quotidiennement** quels emails passent ou échouent l'authentification DMARC
- Vous saurez **exactement** pourquoi vos emails vont dans les spams
- Vous verrez si SPF, DKIM ou les deux échouent

### 2. **Send Failure Reports To** (Rapports de non-conformité)

**Valeur à mettre :**
```
mailto:noreply@27degres-basseville.fr
```

**Pourquoi c'est important :**
- Ces rapports vous alertent **immédiatement** en cas d'échec d'authentification
- Utile pour détecter les tentatives de spoofing (usurpation de votre domaine)
- Vous permet de réagir rapidement aux problèmes

---

## 📝 Instructions Pas à Pas

1. **Dans votre interface DMARC**, trouvez le champ **"Send Aggregate Mail Reports To"**
2. **Tapez :** `mailto:noreply@27degres-basseville.fr`
3. **Trouvez le champ** **"Send Failure Reports To"**
4. **Tapez :** `mailto:noreply@27degres-basseville.fr`
5. **Cliquez sur "Sauvegarder"** (le bouton orange)

---

## 📧 Que faire avec ces rapports ?

### Les rapports agrégés (quotidiens)

Vous recevrez un email **chaque jour** avec un fichier XML compressé contenant :
- Le nombre d'emails envoyés depuis votre domaine
- Combien ont réussi/passé SPF
- Combien ont réussi/passé DKIM
- Combien ont réussi/passé DMARC
- Les adresses IP qui envoient des emails en votre nom

### Comment les analyser

1. **Utilisez un outil en ligne** pour décoder les rapports XML :
   - https://dmarcian.com/dmarc-xml-parser/
   - https://www.dmarcanalyzer.com/dmarc-xml-parser/

2. **Vérifiez :**
   - Que vos emails légitimes passent bien SPF et DKIM
   - S'il y a des échecs, identifiez pourquoi
   - S'il y a des envois suspects depuis des IP inconnues

---

## 🎯 Prochaines Étapes (Après avoir rempli les rapports)

### Phase 1 : Surveillance (1-2 semaines)
- ✅ Gardez `p=none` (Policy: Aucun)
- ✅ Surveillez les rapports quotidiens
- ✅ Vérifiez que tous vos emails légitimes passent

### Phase 2 : Quarantaine (Après 1-2 semaines si tout est OK)
- 🔄 Changez **Policy** de "Aucun" à **"Quarantaine"**
- 🔄 Changez **Subdomain Policy** de "Aucun" à **"Quarantaine"**
- 📊 Continuez à surveiller les rapports

### Phase 3 : Rejet (Après 1 mois si tout est parfait)
- 🔒 Changez **Policy** de "Quarantaine" à **"Reject"**
- 🔒 Changez **Subdomain Policy** de "Quarantaine" à **"Reject"**
- ✅ Vos emails seront alors mieux protégés contre le spam

---

## ⚠️ Attention

**Sans les rapports DMARC remplis, vous ne saurez JAMAIS pourquoi vos emails vont dans les spams !**

Les rapports sont votre **seul moyen** de diagnostiquer les problèmes d'authentification email.

---

## 🧪 Test Après Configuration

1. **Attendez 24-48h** pour la propagation DNS
2. **Envoyez quelques emails** depuis votre application
3. **Vérifiez votre boîte mail** `noreply@27degres-basseville.fr` pour les rapports
4. **Testez avec mail-tester.com** : https://www.mail-tester.com/
   - Envoyez un email à l'adresse fournie
   - Vérifiez votre score (objectif : ≥ 8/10)

---

*Dernière mise à jour : Février 2026*
