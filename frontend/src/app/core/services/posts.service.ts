import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category?: string;
  authorId: number;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  publishDate?: Date;
  status: 'draft' | 'published';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les posts publiés (public)
   */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  /**
   * Récupère tous les posts (admin)
   */
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/admin/all`);
  }

  /**
   * Récupère les posts récents
   */
  getRecentPosts(limit?: number): Observable<Post[]> {
    const url = limit ? `${this.apiUrl}/recent?limit=${limit}` : `${this.apiUrl}/recent`;
    return this.http.get<Post[]>(url);
  }

  /**
   * Récupère un post par son ID
   */
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère un post par son slug
   */
  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/slug/${slug}`);
  }

  /**
   * Crée un nouveau post
   */
  createPost(postData: Partial<Post>, featuredImage?: File): Observable<Post> {
    const formData = new FormData();
    
    Object.keys(postData).forEach(key => {
      const value = (postData as any)[key];
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

    return this.http.post<Post>(this.apiUrl, formData);
  }

  /**
   * Met à jour un post
   */
  updatePost(id: number, postData: Partial<Post>, featuredImage?: File): Observable<Post> {
    const formData = new FormData();
    
    Object.keys(postData).forEach(key => {
      const value = (postData as any)[key];
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

    return this.http.patch<Post>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Supprime un post
   */
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

