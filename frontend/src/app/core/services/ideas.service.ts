import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Idea, IdeaComment } from '../models/idea.model';

@Injectable({
  providedIn: 'root'
})
export class IdeasService {
  private apiUrl = `${environment.apiUrl}/ideas`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les idées avec filtres
   */
  getIdeas(
    category?: string,
    status?: string,
    sortBy: 'popular' | 'recent' | 'comments' = 'popular'
  ): Observable<Idea[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (status) params = params.set('status', status);
    params = params.set('sortBy', sortBy);

    return this.http.get<Idea[]>(this.apiUrl, { params });
  }

  /**
   * Récupère une idée par son ID
   */
  getIdea(id: number): Observable<Idea> {
    return this.http.get<Idea>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle idée
   */
  createIdea(idea: {
    title: string;
    description: string;
    category?: 'activity' | 'project' | 'improvement' | 'event';
    estimatedBudget?: number;
  }): Observable<Idea> {
    return this.http.post<Idea>(this.apiUrl, idea);
  }

  /**
   * Met à jour une idée
   */
  updateIdea(id: number, updates: Partial<Idea>): Observable<Idea> {
    return this.http.patch<Idea>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Supprime une idée
   */
  deleteIdea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Vote pour une idée
   */
  vote(ideaId: number, isUpvote: boolean): Observable<{ voted: boolean; isUpvote: boolean | null }> {
    return this.http.post<{ voted: boolean; isUpvote: boolean | null }>(
      `${this.apiUrl}/${ideaId}/vote`,
      { isUpvote }
    );
  }

  /**
   * Ajoute un commentaire à une idée
   */
  addComment(ideaId: number, content: string): Observable<IdeaComment> {
    return this.http.post<IdeaComment>(`${this.apiUrl}/${ideaId}/comments`, { content });
  }

  /**
   * Supprime un commentaire
   */
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}
