import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountingService } from '../../../core/services/accounting.service';
import { NotificationService } from '../../../core/services/notification.service';
import { YearlySummary, EXPENSE_CATEGORY_LABELS } from '../../../core/models/expense.model';

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './accounting-dashboard.component.html',
  styleUrl: './accounting-dashboard.component.scss'
})
export class AccountingDashboardComponent implements OnInit {
  summary: YearlySummary | null = null;
  comparison: any = null;
  loading = true;
  loadingComparison = false;
  selectedYear: number;
  compareYear: number | null = null;
  currentYear = new Date().getFullYear();
  availableYears: number[] = [];
  categoryLabels = EXPENSE_CATEGORY_LABELS;

  // Couleurs pour les catégories
  private categoryColors: { [key: string]: string } = {
    'location_salle': '#3B82F6',      // Blue
    'materiel': '#10B981',            // Green
    'transport': '#F59E0B',            // Amber
    'communication': '#8B5CF6',       // Purple
    'assurance': '#EF4444',            // Red
    'frais_bancaires': '#6B7280',      // Gray
    'evenements': '#EC4899',           // Pink
    'administratif': '#14B8A6',       // Teal
    'autre': '#6366F1',                // Indigo
  };

  constructor(
    private accountingService: AccountingService,
    private notification: NotificationService
  ) {
    this.selectedYear = this.currentYear;
    this.compareYear = this.currentYear - 1;
    // Générer les années disponibles
    for (let i = 0; i < 5; i++) {
      this.availableYears.push(this.currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadSummary();
    if (this.compareYear) {
      this.loadComparison();
    }
  }

  loadSummary(): void {
    this.loading = true;
    this.accountingService.getYearlySummary(this.selectedYear).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
        if (this.compareYear) {
          this.loadComparison();
        }
      },
      error: () => {
        this.notification.showError('Erreur lors du chargement des données comptables');
        this.loading = false;
      }
    });
  }

  loadComparison(): void {
    if (!this.compareYear) return;
    this.loadingComparison = true;
    this.accountingService.compareYears(this.compareYear, this.selectedYear).subscribe({
      next: (comparison) => {
        this.comparison = comparison;
        this.loadingComparison = false;
      },
      error: () => {
        this.loadingComparison = false;
      }
    });
  }

  onYearChange(): void {
    this.loadSummary();
  }

  onCompareYearChange(): void {
    this.loadComparison();
  }

  exportExcel(): void {
    this.accountingService.exportExcel(this.selectedYear).subscribe({
      error: () => {
        this.notification.showError('Erreur lors de l\'export Excel');
      }
    });
  }

  exportPdf(): void {
    this.accountingService.exportPdf(this.selectedYear).subscribe({
      error: () => {
        this.notification.showError('Erreur lors de l\'export PDF');
      }
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getBalanceColor(): string {
    if (!this.summary) return 'gray';
    return this.summary.balance >= 0 ? 'green' : 'red';
  }

  getCategoryEntries(): Array<{ category: string; amount: number; label: string }> {
    if (!this.summary) return [];
    return Object.entries(this.summary.expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        label: this.categoryLabels[category as keyof typeof this.categoryLabels] || category
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getCategoryPercentage(amount: number): number {
    if (!this.summary || this.summary.totalExpenses === 0) return 0;
    return (amount / this.summary.totalExpenses) * 100;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#6366F1';
  }
}
