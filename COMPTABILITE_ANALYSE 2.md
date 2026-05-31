# 💰 Analyse et Recommandations - Module Comptabilité

## 📊 Vue d'ensemble

Le module de comptabilité doit permettre de :
1. **Enregistrer les dépenses** avec catégorisation
2. **Suivre les recettes** (cotisations payées)
3. **Calculer le solde** par année (recettes - dépenses)
4. **Visualiser l'état financier** de l'association

---

## 🏗️ Architecture Proposée

### 1. **Entité Expense (Dépense)**

```typescript
{
  id: number;
  amount: number;              // Montant (décimal)
  date: Date;                  // Date de la dépense
  description: string;         // Description détaillée
  category: ExpenseCategory;   // Catégorie (enum)
  year: number;                // Année comptable
  receiptUrl?: string;         // URL du justificatif (PDF/image)
  createdBy: number;           // ID de l'admin qui a créé
  validatedBy?: number;       // ID de l'admin qui a validé (optionnel)
  validatedAt?: Date;          // Date de validation
  notes?: string;              // Notes additionnelles
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. **Catégories de Dépenses**

```typescript
enum ExpenseCategory {
  LOCATION_SALLE = 'location_salle',           // Location de salle/réunion
  MATERIEL = 'materiel',                       // Matériel et fournitures
  TRANSPORT = 'transport',                     // Transport et déplacement
  COMMUNICATION = 'communication',             // Communication, marketing, site web
  ASSURANCE = 'assurance',                     // Assurances
  FRAIS_BANCAIRES = 'frais_bancaires',         // Frais bancaires
  EVENEMENTS = 'evenements',                   // Organisation d'événements
  ADMINISTRATIF = 'administratif',             // Frais administratifs
  AUTRE = 'autre'                             // Autre
}
```

---

## 📈 Fonctionnalités Principales

### **A. Gestion des Dépenses**

#### 1. **Création/Modification/Suppression**
- Formulaire avec validation
- Upload de justificatif (PDF/image)
- Sélection de la catégorie
- Date de dépense (peut être dans le passé)
- Notes optionnelles

#### 2. **Liste des Dépenses**
- Tableau avec filtres :
  - Par année
  - Par catégorie
  - Par période (mois/trimestre)
  - Par montant (min/max)
- Tri par date, montant, catégorie
- Recherche par description
- Actions : Voir, Modifier, Supprimer, Télécharger justificatif

#### 3. **Validation des Dépenses** (Optionnel mais recommandé)
- Statut : "En attente" / "Validée" / "Rejetée"
- Possibilité pour le bureau de valider les dépenses
- Traçabilité (qui a validé, quand)

---

### **B. Vue Comptable (Dashboard)**

#### 1. **Vue par Année**
```
┌─────────────────────────────────────────┐
│  Année : 2026                           │
├─────────────────────────────────────────┤
│  RECETTES                                │
│  • Cotisations payées : 1 200,00 €      │
│  • Total recettes : 1 200,00 €          │
├─────────────────────────────────────────┤
│  DÉPENSES                                │
│  • Location salle : 300,00 €            │
│  • Matériel : 150,00 €                  │
│  • Communication : 50,00 €              │
│  • Total dépenses : 500,00 €             │
├─────────────────────────────────────────┤
│  SOLDE : +700,00 € ✅                    │
└─────────────────────────────────────────┘
```

#### 2. **Répartition par Catégorie**
- Graphique en secteurs (pie chart)
- Graphique en barres par catégorie
- Évolution mensuelle (ligne de temps)

#### 3. **Comparaison Années**
- Comparaison année N vs année N-1
- Tendances (hausse/baisse)

---

### **C. Rapports et Exports**

#### 1. **Export PDF**
- Rapport annuel complet
- Liste des dépenses avec justificatifs
- Bilan comptable

#### 2. **Export Excel/CSV**
- Données brutes pour traitement externe
- Compatible avec Excel, Google Sheets

---

## 💡 Suggestions Additionnelles

### **1. Budget Prévisionnel** ⭐ Recommandé
- Définir un budget par année
- Alertes si dépenses approchent du budget
- Suivi budget réel vs prévisionnel

```typescript
Budget {
  year: number;
  totalBudget: number;
  budgetByCategory: { [category: string]: number };
}
```

### **2. Alertes et Notifications**
- ⚠️ Solde négatif ou proche de 0
- ⚠️ Dépense importante (> seuil défini)
- 📊 Rapport mensuel automatique par email

### **3. Pièces Justificatives**
- Upload multiple de fichiers
- Stockage sécurisé (Supabase Storage)
- Prévisualisation PDF/images
- Téléchargement groupé

### **4. Tags et Recherche Avancée**
- Tags personnalisés (ex: "urgent", "récurrent", "événement X")
- Recherche full-text dans descriptions
- Filtres combinés multiples

### **5. Validation en Cascade** (Pour associations avec bureau)
- Dépenses < seuil : validation automatique
- Dépenses > seuil : nécessite validation bureau
- Workflow de validation avec notifications

### **6. Revenus Additionnels** (Futur)
- Autres sources de revenus que les cotisations :
  - Ventes boutique
  - Subventions
  - Dons
  - Sponsors

### **7. Rapprochement Bancaire** (Futur)
- Import de relevés bancaires
- Rapprochement automatique
- Marquage des transactions rapprochées

### **8. Rapports Personnalisés**
- Période personnalisée (ex: trimestre, semestre)
- Filtres avancés
- Templates de rapports sauvegardés

---

## 🎨 Interface Utilisateur Proposée

### **Page 1 : Liste des Dépenses** (`/admin/accounting/expenses`)
- Tableau avec toutes les dépenses
- Filtres en haut
- Bouton "Ajouter une dépense"
- Actions sur chaque ligne

### **Page 2 : Vue Comptable** (`/admin/accounting/dashboard`)
- Sélecteur d'année en haut
- Cards avec totaux (recettes, dépenses, solde)
- Graphiques (secteurs, barres, évolution)
- Tableau récapitulatif par catégorie

### **Page 3 : Budget** (`/admin/accounting/budget`) - Optionnel
- Définition du budget annuel
- Suivi budget réel vs prévisionnel
- Alertes visuelles

---

## 🔒 Sécurité et Permissions

- **Admin uniquement** : Accès complet
- **Bureau** (si rôle existe) : Lecture + Validation dépenses
- **Audit trail** : Qui a créé/modifié/supprimé chaque dépense

---

## 📊 Structure de Données

### **Table `expenses`**
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  receipt_url VARCHAR(500),
  created_by INT NOT NULL REFERENCES users(id),
  validated_by INT REFERENCES users(id),
  validated_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_year ON expenses(year);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);
```

---

## 🚀 Plan d'Implémentation

### **Phase 1 : Base (Prioritaire)**
1. ✅ Entité Expense + Migration
2. ✅ CRUD dépenses (Backend)
3. ✅ Interface liste dépenses (Frontend)
4. ✅ Formulaire création/modification
5. ✅ Calcul solde par année
6. ✅ Vue comptable avec totaux

### **Phase 2 : Améliorations**
1. ✅ Upload justificatifs
2. ✅ Graphiques et visualisations
3. ✅ Export PDF/Excel
4. ✅ Filtres avancés

### **Phase 3 : Fonctionnalités Avancées**
1. Budget prévisionnel
2. Validation en cascade
3. Alertes automatiques
4. Rapports personnalisés

---

## ❓ Questions à Valider

1. **Validation des dépenses** : Nécessaire ou création = validation automatique ?
2. **Budget** : Souhaitez-vous définir un budget annuel dès maintenant ?
3. **Justificatifs** : Upload obligatoire ou optionnel ?
4. **Rôle Bureau** : Existe-t-il un rôle intermédiaire entre admin et membre ?
5. **Seuil de validation** : Souhaitez-vous un seuil au-delà duquel validation requise ?
6. **Autres revenus** : Besoin de tracker d'autres revenus que cotisations maintenant ?

---

## ✅ Recommandations Finales

**Pour commencer, je recommande :**

1. **Implémenter la base** (Phase 1) avec :
   - CRUD dépenses complet
   - Catégories prédéfinies
   - Vue comptable par année avec calcul solde
   - Upload de justificatifs

2. **Ajouter ensuite** :
   - Graphiques de visualisation
   - Export PDF/Excel
   - Budget prévisionnel (très utile)

3. **Laisser pour plus tard** :
   - Validation en cascade (si pas de rôle bureau)
   - Rapprochement bancaire (complexe)
   - Autres revenus (peut être ajouté facilement plus tard)

**Cette approche permet d'avoir un module fonctionnel rapidement tout en gardant la possibilité d'ajouter des fonctionnalités avancées.**

---

*Souhaitez-vous que je commence l'implémentation avec ces recommandations ?*
