import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IdeasService } from '../../../core/services/ideas.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Idea } from '../../../core/models/idea.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-ideas-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './ideas-management.component.html',
  styleUrl: './ideas-management.component.scss'
})
export class IdeasManagementComponent implements OnInit, OnDestroy {
  ideas: Idea[] = [];
  displayedColumns: string[] = ['title', 'author', 'category', 'status', 'votes', 'comments', 'createdAt', 'actions'];
  loading = false;
  openMenuId: number | null = null;
  clickTimeout: any;
  positionInterval: any;

  statuses = [
    { value: '', label: 'Tous' },
    { value: 'idea', label: 'Idée' },
    { value: 'discussion', label: 'En discussion' },
    { value: 'validated', label: 'Validée' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Réalisée' },
    { value: 'archived', label: 'Archivée' }
  ];

  selectedStatus = '';

  constructor(
    private ideasService: IdeasService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadIdeas();
  }

  ngOnDestroy(): void {
    this.closeMenus();
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
    }
  }

  loadIdeas(): void {
    this.loading = true;
    this.ideasService.getIdeas(
      undefined,
      this.selectedStatus || undefined,
      'recent'
    ).subscribe({
      next: (ideas) => {
        this.ideas = ideas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des idées:', error);
        this.notification.showError('Erreur lors du chargement des idées');
        this.loading = false;
      }
    });
  }

  toggleMenu(ideaId: number, mouseEvent?: MouseEvent): void {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }

    if (this.openMenuId === ideaId) {
      this.closeMenus();
    } else {
      this.closeMenus();
      this.openMenuId = ideaId;
      setTimeout(() => {
        this.positionMenu(ideaId);
        this.positionInterval = setInterval(() => this.positionMenu(ideaId), 100);
      }, 10);
    }
  }

  closeMenus(): void {
    this.openMenuId = null;
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-idea-id]') && !target.closest('[data-menu-idea-id]')) {
      this.closeMenus();
    }
  }

  positionMenu(ideaId: number): void {
    const button = document.querySelector(`[data-idea-id="${ideaId}"]`) as HTMLElement;
    const menu = document.querySelector(`[data-menu-idea-id="${ideaId}"]`) as HTMLElement;
    
    if (button && menu) {
      const rect = button.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.top = `${rect.bottom + 5}px`;
      menu.style.left = `${rect.left}px`;
      menu.style.zIndex = '10000';
    }
  }

  updateStatus(idea: Idea, newStatus: string): void {
    this.ideasService.updateIdea(idea.id, { status: newStatus as any }).subscribe({
      next: () => {
        this.notification.showSuccess('Statut mis à jour');
        this.loadIdeas();
        this.closeMenus();
      },
      error: (error) => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  deleteIdea(idea: Idea): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'idée "${idea.title}" ?`)) {
      return;
    }

    this.ideasService.deleteIdea(idea.id).subscribe({
      next: () => {
        this.notification.showSuccess('Idée supprimée');
        this.loadIdeas();
        this.closeMenus();
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
    const stat = this.statuses.find(s => s.value === status);
    return stat ? stat.label : status;
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

  onStatusFilterChange(): void {
    this.loadIdeas();
  }
}
