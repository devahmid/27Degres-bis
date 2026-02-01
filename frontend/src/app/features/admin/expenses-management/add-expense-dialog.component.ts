import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AccountingService } from '../../../core/services/accounting.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Expense, ExpenseCategory, EXPENSE_CATEGORY_LABELS } from '../../../core/models/expense.model';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <div class="p-6 max-w-2xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-dark">
          {{ isEditMode ? 'Modifier la dépense' : 'Nouvelle dépense' }}
        </h2>
        <button mat-icon-button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Montant -->
        <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">euro</mat-icon>
            Montant <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            formControlName="amount"
            step="0.01"
            min="0.01"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            placeholder="0.00">
          <div *ngIf="expenseForm.get('amount')?.hasError('required') && expenseForm.get('amount')?.touched"
               class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <mat-icon class="text-sm">error</mat-icon>
            Le montant est requis
          </div>
          <div *ngIf="expenseForm.get('amount')?.hasError('min') && expenseForm.get('amount')?.touched"
               class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <mat-icon class="text-sm">error</mat-icon>
            Le montant doit être supérieur à 0
          </div>
        </div>

        <!-- Date -->
        <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">calendar_today</mat-icon>
            Date de la dépense <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            formControlName="date"
            class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
          <div *ngIf="expenseForm.get('date')?.hasError('required') && expenseForm.get('date')?.touched"
               class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <mat-icon class="text-sm">error</mat-icon>
            La date est requise
          </div>
        </div>

        <!-- Description -->
        <div class="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">description</mat-icon>
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            formControlName="description"
            rows="3"
            class="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white resize-y"
            placeholder="Décrivez la dépense..."></textarea>
          <div *ngIf="expenseForm.get('description')?.hasError('required') && expenseForm.get('description')?.touched"
               class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <mat-icon class="text-sm">error</mat-icon>
            La description est requise
          </div>
        </div>

        <!-- Catégorie -->
        <div class="bg-green-50 rounded-lg p-5 border border-green-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">category</mat-icon>
            Catégorie <span class="text-red-500">*</span>
          </label>
          <select
            formControlName="category"
            class="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
            <option value="">Sélectionner une catégorie</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ categoryLabels[cat] }}</option>
          </select>
          <div *ngIf="expenseForm.get('category')?.hasError('required') && expenseForm.get('category')?.touched"
               class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <mat-icon class="text-sm">error</mat-icon>
            La catégorie est requise
          </div>
        </div>

        <!-- Année -->
        <div class="bg-purple-50 rounded-lg p-5 border border-purple-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">event</mat-icon>
            Année comptable <span class="text-red-500">*</span>
          </label>
          <select
            formControlName="year"
            class="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
            <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
          </select>
        </div>

        <!-- Notes -->
        <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">note</mat-icon>
            Notes additionnelles <span class="text-gray-500 text-sm font-normal">(optionnel)</span>
          </label>
          <textarea
            formControlName="notes"
            rows="2"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white resize-y"
            placeholder="Informations complémentaires..."></textarea>
        </div>

        <!-- Justificatif (Upload fichier) -->
        <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <label class="block text-dark font-semibold mb-3 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">attach_file</mat-icon>
            Justificatif <span class="text-gray-500 text-sm font-normal">(optionnel)</span>
          </label>
          
          <!-- Afficher le justificatif existant si en mode édition -->
          <div *ngIf="isEditMode && existingReceiptUrl && !selectedFile" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-600">receipt</mat-icon>
                <span class="text-sm text-gray-700">Justificatif actuel</span>
              </div>
              <a [href]="existingReceiptUrl" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                <mat-icon class="text-sm">open_in_new</mat-icon>
                Voir
              </a>
            </div>
          </div>
          
          <!-- Input fichier -->
          <div class="mb-3">
            <input
              type="file"
              #fileInput
              (change)="onFileSelected($event)"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer">
          </div>
          
          <!-- Afficher le fichier sélectionné -->
          <div *ngIf="selectedFile" class="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-green-600">check_circle</mat-icon>
              <span class="text-sm text-gray-700">{{ selectedFile.name }}</span>
              <span class="text-xs text-gray-500">({{ formatFileSize(selectedFile.size) }})</span>
            </div>
            <button
              type="button"
              (click)="removeFile()"
              class="text-red-600 hover:text-red-800">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>
          
          <p class="text-sm text-gray-600 mt-2">
            <mat-icon class="text-sm align-middle">info</mat-icon>
            Formats acceptés : PDF, images (JPG, PNG), documents (DOC, DOCX). Taille max : 10 MB
          </p>
        </div>

        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            mat-stroked-button 
            type="button" 
            (click)="onCancel()"
            class="px-6">
            Annuler
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="expenseForm.invalid || isSubmitting"
            class="px-8 flex items-center gap-2">
            <mat-icon *ngIf="!isSubmitting">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
            <mat-icon *ngIf="isSubmitting" class="animate-spin">refresh</mat-icon>
            <span *ngIf="!isSubmitting && !isEditMode">Ajouter la dépense</span>
            <span *ngIf="!isSubmitting && isEditMode">Enregistrer les modifications</span>
            <span *ngIf="isSubmitting">Enregistrement...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class AddExpenseDialogComponent implements OnInit {
  expenseForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  categories = Object.values(ExpenseCategory);
  categoryLabels = EXPENSE_CATEGORY_LABELS;
  currentYear = new Date().getFullYear();
  availableYears: number[] = [];
  selectedFile: File | null = null;
  existingReceiptUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<AddExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Expense
  ) {
    // Générer les années disponibles (année actuelle + 2 ans en arrière)
    for (let i = 0; i < 5; i++) {
      this.availableYears.push(this.currentYear - i);
    }

    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      year: [this.currentYear, Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      // Formater la date pour l'input date (YYYY-MM-DD)
      const date = new Date(this.data.date);
      const formattedDate = date.toISOString().split('T')[0];
      
      this.expenseForm.patchValue({
        amount: this.data.amount,
        date: formattedDate,
        description: this.data.description,
        category: this.data.category,
        year: this.data.year,
        notes: this.data.notes || '',
      });
      
      // Conserver l'URL du justificatif existant
      if (this.data.receiptUrl) {
        this.existingReceiptUrl = this.data.receiptUrl;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Vérifier la taille (10 MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.notification.showError('Le fichier est trop volumineux. Taille maximale : 10 MB');
        return;
      }
      this.selectedFile = file;
      // Effacer l'URL existante si un nouveau fichier est sélectionné
      this.existingReceiptUrl = null;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    // Réinitialiser l'input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.expenseForm.value;
    
    // Ne pas inclure receiptUrl dans le FormData, le fichier sera géré séparément
    delete formValue.receiptUrl;

    if (this.isEditMode && this.data) {
      this.accountingService.updateExpense(this.data.id, formValue, this.selectedFile || undefined).subscribe({
        next: () => {
          this.notification.showSuccess('Dépense modifiée avec succès');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.notification.showError(error.error?.message || 'Erreur lors de la modification');
          this.isSubmitting = false;
        }
      });
    } else {
      this.accountingService.createExpense(formValue, this.selectedFile || undefined).subscribe({
        next: () => {
          this.notification.showSuccess('Dépense ajoutée avec succès');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.notification.showError(error.error?.message || 'Erreur lors de l\'ajout');
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
