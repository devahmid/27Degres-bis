import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AccountingService } from '../../../core/services/accounting.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Expense, ExpenseCategory, EXPENSE_CATEGORY_LABELS } from '../../../core/models/expense.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AddExpenseDialogComponent } from './add-expense-dialog.component';

@Component({
  selector: 'app-expenses-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    DateFormatPipe
  ],
  templateUrl: './expenses-management.component.html',
  styleUrl: './expenses-management.component.scss'
})
export class ExpensesManagementComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  displayedColumns: string[] = ['date', 'description', 'category', 'amount', 'year', 'actions'];
  loading = true;
  
  filterYear: number | '' = '';
  filterCategory: ExpenseCategory | '' = '';
  searchTerm = '';
  currentYear = new Date().getFullYear();
  
  categoryLabels = EXPENSE_CATEGORY_LABELS;
  categories = Object.values(ExpenseCategory);

  constructor(
    private accountingService: AccountingService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.loading = true;
    const year = this.filterYear ? Number(this.filterYear) : undefined;
    const category = this.filterCategory || undefined;
    
    this.accountingService.getExpenses(year, category).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.notification.showError('Erreur lors du chargement des dépenses');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.expenses];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(term) ||
        this.getCategoryLabel(e.category).toLowerCase().includes(term)
      );
    }
    
    this.filteredExpenses = filtered;
  }

  onFilterChange(): void {
    this.loadExpenses();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AddExpenseDialogComponent, {
      width: '600px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
      }
    });
  }

  openEditDialog(expense: Expense): void {
    const dialogRef = this.dialog.open(AddExpenseDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: expense
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
      }
    });
  }

  deleteExpense(expense: Expense): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la dépense "${expense.description}" ?`)) {
      return;
    }

    this.accountingService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.notification.showSuccess('Dépense supprimée avec succès');
        this.loadExpenses();
      },
      error: () => {
        this.notification.showError('Erreur lors de la suppression');
      }
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }

  getCategoryLabel(category: ExpenseCategory): string {
    return this.categoryLabels[category] || category;
  }

  exportExcel(): void {
    const year = this.filterYear ? Number(this.filterYear) : undefined;
    this.accountingService.exportExcel(year).subscribe({
      error: () => {
        this.notification.showError('Erreur lors de l\'export Excel');
      }
    });
  }
}
