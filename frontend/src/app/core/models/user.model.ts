export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'bureau' | 'membre' | 'visiteur';
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  joinDate: Date;
  isActive: boolean;
  avatarUrl?: string;
  consentAnnuaire: boolean;
  consentNewsletter: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}









