export interface Cotisation {
  id: number;
  userId: number;
  year: number;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}









