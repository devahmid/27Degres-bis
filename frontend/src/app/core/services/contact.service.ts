import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateContactMessageDto {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  create(message: CreateContactMessageDto): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(this.apiUrl, message);
  }

  getAll(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.apiUrl}/admin`);
  }

  getById(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.apiUrl}/admin/${id}`);
  }

  markAsRead(id: number): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.apiUrl}/admin/${id}/read`, {});
  }

  reply(id: number, message: string, fromName?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/${id}/reply`, { message, fromName });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }
}

