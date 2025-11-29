import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Document {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  uploadedBy?: number;
  assignedToUserId?: number;
  assignedToUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les documents
   * @param userId Optionnel : ID de l'utilisateur pour filtrer les documents assignés
   */
  getDocuments(userId?: number): Observable<Document[]> {
    const url = userId ? `${this.apiUrl}/user/${userId}` : this.apiUrl;
    return this.http.get<Document[]>(url);
  }

  /**
   * Récupère un document par son ID
   */
  getDocument(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload un document
   * @param file Le fichier à uploader
   * @param title Titre du document
   * @param description Description (optionnel)
   * @param category Catégorie (optionnel)
   * @param assignedToUserId ID de l'utilisateur auquel le document est assigné (optionnel, ex: reçu de cotisation)
   */
  uploadDocument(
    file: File,
    title: string,
    description?: string,
    category?: string,
    assignedToUserId?: number
  ): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    if (category) {
      formData.append('category', category);
    }
    if (assignedToUserId) {
      formData.append('assignedToUserId', assignedToUserId.toString());
    }

    return this.http.post<Document>(this.apiUrl, formData);
  }

  /**
   * Récupère une URL signée pour télécharger un document
   * @param id ID du document
   * @param expiresIn Durée de validité en secondes (défaut: 3600 = 1 heure)
   */
  getDownloadUrl(id: number, expiresIn: number = 3600): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/${id}/download`);
  }

  /**
   * Télécharge un document en ouvrant l'URL signée dans un nouvel onglet
   */
  downloadDocument(id: number): void {
    this.getDownloadUrl(id).subscribe({
      next: (response) => {
        window.open(response.url, '_blank');
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement du document');
      }
    });
  }

  /**
   * Supprime un document (admin/bureau uniquement)
   */
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

