export interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  type: 'weekend' | 'reunion' | 'activite';
  startDate: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: number;
  featuredImage?: string;
  status: 'draft' | 'published' | 'cancelled';
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
  registeredUsers?: number[];
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: Date;
}









