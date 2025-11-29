import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { RouterModule } from '@angular/router';

export interface Comment {
  id: number;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  post?: {
    id: number;
    title: string;
    slug: string;
  };
}

@Component({
  selector: 'app-comments-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    DateFormatPipe
  ],
  templateUrl: './comments-management.component.html',
  styleUrl: './comments-management.component.scss'
})
export class CommentsManagementComponent implements OnInit {
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  comments$ = this.commentsSubject.asObservable();
  filteredComments$!: Observable<Comment[]>;
  filterApproved = '';
  searchTerm = '';
  displayedColumns: string[] = ['post', 'user', 'content', 'status', 'createdAt', 'actions'];

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.http.get<Comment[]>(`${environment.apiUrl}/posts/admin/comments`).subscribe({
      next: (comments) => {
        this.commentsSubject.next(comments);
      },
      error: (err) => {
        this.notification.showError('Erreur lors du chargement des commentaires.');
      }
    });

    this.filteredComments$ = combineLatest([
      this.comments$,
      this.commentsSubject.asObservable().pipe(
        map(() => this.searchTerm),
        startWith(this.searchTerm)
      ),
      this.commentsSubject.asObservable().pipe(
        map(() => this.filterApproved),
        startWith(this.filterApproved)
      )
    ]).pipe(
      map(([comments, searchTerm, filterApproved]) => {
        let filtered = [...comments];

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(c =>
            c.content.toLowerCase().includes(term) ||
            c.user?.firstName.toLowerCase().includes(term) ||
            c.user?.lastName.toLowerCase().includes(term) ||
            c.post?.title.toLowerCase().includes(term)
          );
        }

        if (filterApproved === 'approved') {
          filtered = filtered.filter(c => c.isApproved);
        } else if (filterApproved === 'unapproved') {
          filtered = filtered.filter(c => !c.isApproved);
        }

        return filtered;
      })
    );
  }

  onSearchChange(): void {
    this.commentsSubject.next(this.commentsSubject.getValue());
  }

  approveComment(comment: Comment): void {
    this.http.patch(`${environment.apiUrl}/posts/comments/${comment.id}/approve`, {}).subscribe({
      next: () => {
        this.notification.showSuccess('Commentaire approuvé !');
        this.loadComments();
      },
      error: () => {
        this.notification.showError('Erreur lors de l\'approbation du commentaire.');
      }
    });
  }

  deleteComment(comment: Comment): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce commentaire ?`)) {
      this.http.delete(`${environment.apiUrl}/posts/comments/${comment.id}`).subscribe({
        next: () => {
          this.notification.showSuccess('Commentaire supprimé !');
          this.loadComments();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression du commentaire.');
        }
      });
    }
  }
}

