import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  type?: 'weekend' | 'reunion' | 'activite';
  startDate: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: number;
  featuredImage?: string;
  status: 'draft' | 'published' | 'cancelled';
  createdBy?: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  registrations?: any[];
  images?: any[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les événements publiés (public)
   */
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  /**
   * Récupère tous les événements (admin)
   */
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/admin/all`);
  }

  /**
   * Récupère les événements à venir
   */
  getUpcomingEvents(limit?: number): Observable<Event[]> {
    const url = limit ? `${this.apiUrl}/upcoming?limit=${limit}` : `${this.apiUrl}/upcoming`;
    return this.http.get<Event[]>(url);
  }

  /**
   * Récupère un événement par son ID
   */
  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouvel événement
   */
  createEvent(eventData: Partial<Event>, featuredImage?: File): Observable<Event> {
    const formData = new FormData();
    
    Object.keys(eventData).forEach(key => {
      const value = (eventData as any)[key];
      if (value !== null && value !== undefined) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    return this.http.post<Event>(this.apiUrl, formData);
  }

  /**
   * Met à jour un événement
   */
  updateEvent(id: number, eventData: Partial<Event>, featuredImage?: File): Observable<Event> {
    const formData = new FormData();
    
    Object.keys(eventData).forEach(key => {
      const value = (eventData as any)[key];
      if (value !== null && value !== undefined) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    return this.http.patch<Event>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Supprime un événement
   */
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload une image pour un événement
   */
  uploadEventImage(eventId: number, image: File, caption?: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    if (caption) {
      formData.append('caption', caption);
    }
    return this.http.post(`${this.apiUrl}/${eventId}/images`, formData);
  }

  /**
   * S'inscrire à un événement
   */
  registerToEvent(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/register`, {});
  }

  /**
   * Se désinscrire d'un événement
   */
  unregisterFromEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
  }

  /**
   * Vérifier si l'utilisateur est inscrit à un événement
   */
  isRegisteredToEvent(eventId: number): Observable<{ registered: boolean }> {
    return this.http.get<{ registered: boolean }>(`${this.apiUrl}/${eventId}/registered`);
  }

  /**
   * Récupère toutes les images d'événements
   */
  getAllEventImages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/images`);
  }
}

