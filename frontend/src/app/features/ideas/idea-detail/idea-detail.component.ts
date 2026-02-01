import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IdeasService } from '../../../core/services/ideas.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Idea, IdeaComment } from '../../../core/models/idea.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-idea-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    DateFormatPipe
  ],
  templateUrl: './idea-detail.component.html',
  styleUrl: './idea-detail.component.scss'
})
export class IdeaDetailComponent implements OnInit {
  idea: Idea | null = null;
  loading = true;
  comments: IdeaComment[] = [];
  commentForm: FormGroup;
  submittingComment = false;
  voting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ideasService: IdeasService,
    public authService: AuthService,
    private notification: NotificationService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIdea(+id);
    }
  }

  loadIdea(id: number): void {
    this.loading = true;
    this.ideasService.getIdea(id).subscribe({
      next: (idea) => {
        this.idea = idea;
        this.comments = idea.ideaComments || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'idée:', error);
        this.notification.showError('Erreur lors du chargement de l\'idée');
        this.loading = false;
      }
    });
  }

  vote(isUpvote: boolean): void {
    if (!this.authService.isLoggedIn() || !this.idea || this.voting) {
      return;
    }

    this.voting = true;
    this.ideasService.vote(this.idea.id, isUpvote).subscribe({
      next: (result) => {
        if (this.idea) {
          // Recharger l'idée pour avoir les nouveaux votes
          this.loadIdea(this.idea.id);
        }
        this.voting = false;
      },
      error: (error) => {
        this.notification.showError('Erreur lors du vote');
        this.voting = false;
      }
    });
  }

  submitComment(): void {
    if (!this.authService.isLoggedIn() || !this.idea || this.commentForm.invalid || this.submittingComment) {
      return;
    }

    this.submittingComment = true;
    this.ideasService.addComment(this.idea.id, this.commentForm.value.content).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.commentForm.reset();
        if (this.idea) {
          this.idea.commentsCount++;
        }
        this.notification.showSuccess('Commentaire ajouté');
        this.submittingComment = false;
      },
      error: (error) => {
        this.notification.showError('Erreur lors de l\'ajout du commentaire');
        this.submittingComment = false;
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    this.ideasService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        if (this.idea) {
          this.idea.commentsCount--;
        }
        this.notification.showSuccess('Commentaire supprimé');
      },
      error: (error) => {
        this.notification.showError('Erreur lors de la suppression');
      }
    });
  }

  canEditIdea(): boolean {
    if (!this.idea || !this.authService.isLoggedIn()) return false;
    const user = this.authService.getCurrentUser();
    return !!(user && (user.id === this.idea.authorId || user.role === 'admin' || user.role === 'bureau'));
  }

  canDeleteComment(comment: IdeaComment): boolean {
    if (!this.authService.isLoggedIn()) return false;
    const user = this.authService.getCurrentUser();
    return !!(user && (user.id === comment.authorId || user.role === 'admin' || user.role === 'bureau'));
  }

  deleteIdea(): void {
    if (!this.idea || !confirm('Êtes-vous sûr de vouloir supprimer cette idée ?')) {
      return;
    }

    this.ideasService.deleteIdea(this.idea.id).subscribe({
      next: () => {
        this.notification.showSuccess('Idée supprimée');
        this.router.navigate(['/ideas']);
      },
      error: (error) => {
        this.notification.showError('Erreur lors de la suppression');
      }
    });
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'activity': 'Activité',
      'project': 'Projet',
      'improvement': 'Amélioration',
      'event': 'Événement'
    };
    return labels[category] || category;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'idea': 'Idée',
      'discussion': 'En discussion',
      'validated': 'Validée',
      'in_progress': 'En cours',
      'completed': 'Réalisée',
      'archived': 'Archivée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'idea': '#e5e7eb',
      'discussion': '#dbeafe',
      'validated': '#d1fae5',
      'in_progress': '#fed7aa',
      'completed': '#d1fae5',
      'archived': '#f3f4f6'
    };
    return colors[status] || '#e5e7eb';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'activity': '#e0e7ff',
      'project': '#fce7f3',
      'improvement': '#fef3c7',
      'event': '#dbeafe'
    };
    return colors[category] || '#f3f4f6';
  }

  getCategoryTextColor(category: string): string {
    const colors: Record<string, string> = {
      'activity': '#3730a3',
      'project': '#9f1239',
      'improvement': '#78350f',
      'event': '#1e40af'
    };
    return colors[category] || '#374151';
  }

  getStatusTextColor(status: string): string {
    const colors: Record<string, string> = {
      'idea': '#374151',
      'discussion': '#1e40af',
      'validated': '#065f46',
      'in_progress': '#92400e',
      'completed': '#ffffff',
      'archived': '#6b7280'
    };
    return colors[status] || '#374151';
  }
}
