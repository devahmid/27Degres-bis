import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GalleryImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isPublic: boolean;
  category?: string;
  uploadedBy?: number;
  uploader?: {
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
export class GalleryService {
  private apiUrl = `${environment.apiUrl}/gallery`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les images (publiques + privées de l'utilisateur connecté)
   */
  getImages(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(this.apiUrl);
  }

  /**
   * Récupère toutes les images (admin)
   */
  getAllImages(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.apiUrl}/admin/all`);
  }

  /**
   * Récupère une image par son ID
   */
  getImage(id: number): Observable<GalleryImage> {
    return this.http.get<GalleryImage>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload une nouvelle image
   */
  uploadImage(
    file: File,
    caption?: string,
    isPublic: boolean = true,
    category?: string
  ): Observable<GalleryImage> {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) {
      formData.append('caption', caption);
    }
    formData.append('isPublic', isPublic.toString());
    if (category) {
      formData.append('category', category);
    }

    return this.http.post<GalleryImage>(this.apiUrl, formData);
  }

  /**
   * Met à jour une image
   */
  updateImage(
    id: number,
    caption?: string,
    isPublic?: boolean,
    category?: string
  ): Observable<GalleryImage> {
    const body: any = {};
    if (caption !== undefined) body.caption = caption;
    if (isPublic !== undefined) body.isPublic = isPublic;
    if (category !== undefined) body.category = category;

    return this.http.patch<GalleryImage>(`${this.apiUrl}/${id}`, body);
  }

  /**
   * Supprime une image
   */
  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
