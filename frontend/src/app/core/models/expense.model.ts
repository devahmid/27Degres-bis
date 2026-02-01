export enum ExpenseCategory {
  LOCATION_SALLE = 'location_salle',
  MATERIEL = 'materiel',
  TRANSPORT = 'transport',
  COMMUNICATION = 'communication',
  ASSURANCE = 'assurance',
  FRAIS_BANCAIRES = 'frais_bancaires',
  EVENEMENTS = 'evenements',
  ADMINISTRATIF = 'administratif',
  AUTRE = 'autre',
}

export interface Expense {
  id: number;
  amount: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  year: number;
  receiptUrl?: string;
  createdBy: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  validatedBy?: number;
  validator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  validatedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface YearlySummary {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: { [key: string]: number };
  cotisationsCount: number;
  expensesCount: number;
}

export const EXPENSE_CATEGORY_LABELS: { [key in ExpenseCategory]: string } = {
  [ExpenseCategory.LOCATION_SALLE]: 'Location de salle',
  [ExpenseCategory.MATERIEL]: 'Matériel / Fournitures',
  [ExpenseCategory.TRANSPORT]: 'Transport / Déplacement',
  [ExpenseCategory.COMMUNICATION]: 'Communication / Marketing',
  [ExpenseCategory.ASSURANCE]: 'Assurance',
  [ExpenseCategory.FRAIS_BANCAIRES]: 'Frais bancaires',
  [ExpenseCategory.EVENEMENTS]: 'Événements / Organisation',
  [ExpenseCategory.ADMINISTRATIF]: 'Administratif',
  [ExpenseCategory.AUTRE]: 'Autre',
};
