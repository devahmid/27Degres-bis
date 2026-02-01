import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { IdeasService } from '../../../core/services/ideas.service';
import { Idea } from '../../../core/models/idea.model';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-idea-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
    DateFormatPipe
  ],
  templateUrl: './idea-list.component.html',
  styleUrl: './idea-list.component.scss'
})
export class IdeaListComponent implements OnInit {
  ideas: Idea[] = [];
  loading = true;
  selectedCategory: string = '';
  selectedStatus: string = '';
  selectedSort: 'popular' | 'recent' | 'comments' = 'popular';

  categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'activity', label: 'Activité' },
    { value: 'project', label: 'Projet' },
    { value: 'improvement', label: 'Amélioration' },
    { value: 'event', label: 'Événement' }
  ];

  statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'idea', label: 'Idée' },
    { value: 'discussion', label: 'En discussion' },
    { value: 'validated', label: 'Validée' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Réalisée' },
    { value: 'archived', label: 'Archivée' }
  ];

  sortOptions = [
    { value: 'popular', label: 'Populaires' },
    { value: 'recent', label: 'Récentes' },
    { value: 'comments', label: 'Plus commentées' }
  ];

  constructor(
    private ideasService: IdeasService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.loading = true;
    this.ideasService.getIdeas(
      this.selectedCategory || undefined,
      this.selectedStatus || undefined,
      this.selectedSort
    ).subscribe({
      next: (ideas) => {
        this.ideas = ideas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des idées:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadIdeas();
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
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
      'completed': '#10b981',
      'archived': '#f3f4f6'
    };
    return colors[status] || '#e5e7eb';
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
}
