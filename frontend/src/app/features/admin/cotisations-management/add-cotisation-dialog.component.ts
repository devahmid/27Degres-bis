import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-add-cotisation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 max-w-2xl">
      <h2 class="text-2xl font-bold mb-6 text-dark">Ajouter une cotisation</h2>
      
      <form [formGroup]="cotisationForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-dark font-medium mb-2">Membre *</label>
          <select 
            formControlName="userId"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
            <option value="">Sélectionner un membre</option>
            <option *ngFor="let user of (users$ | async)" [value]="user.id">
              {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
            </option>
          </select>
          <div *ngIf="cotisationForm.get('userId')?.hasError('required') && cotisationForm.get('userId')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le membre est requis
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Année *</label>
            <input 
              type="number" 
              formControlName="year" 
              required
              [min]="currentYear - 5"
              [max]="currentYear + 1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="{{ currentYear }}">
            <div *ngIf="cotisationForm.get('year')?.hasError('required') && cotisationForm.get('year')?.touched" 
                 class="text-red-500 text-sm mt-1">
              L'année est requise
            </div>
            <div *ngIf="cotisationForm.get('year')?.hasError('min') && cotisationForm.get('year')?.touched" 
                 class="text-red-500 text-sm mt-1">
              L'année ne peut pas être antérieure à {{ currentYear - 5 }}
            </div>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Montant (€) *</label>
            <input 
              type="number" 
              formControlName="amount" 
              required
              step="0.01"
              min="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="60.00">
            <div *ngIf="cotisationForm.get('amount')?.hasError('required') && cotisationForm.get('amount')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Le montant est requis
            </div>
            <div *ngIf="cotisationForm.get('amount')?.hasError('min') && cotisationForm.get('amount')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Le montant doit être positif
            </div>
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Statut *</label>
          <select 
            formControlName="status"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
            <option value="pending">En attente</option>
            <option value="paid">Payée</option>
            <option value="overdue">En retard</option>
          </select>
          <div *ngIf="cotisationForm.get('status')?.hasError('required') && cotisationForm.get('status')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le statut est requis
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Méthode de paiement</label>
            <input 
              type="text" 
              formControlName="paymentMethod"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Carte bancaire, Chèque, Espèces...">
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">ID de transaction</label>
            <input 
              type="text" 
              formControlName="transactionId"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="ID transaction (optionnel)">
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-4">
          <button 
            type="button"
            mat-dialog-close
            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button 
            type="submit"
            [disabled]="cotisationForm.invalid || isSubmitting"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!isSubmitting">Ajouter</span>
            <span *ngIf="isSubmitting">Ajout en cours...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AddCotisationDialogComponent implements OnInit {
  cotisationForm: FormGroup;
  isSubmitting = false;
  users$!: Observable<User[]>;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<AddCotisationDialogComponent>
  ) {
    this.cotisationForm = this.fb.group({
      userId: ['', [Validators.required]],
      year: [this.currentYear, [Validators.required, Validators.min(this.currentYear - 5)]],
      amount: ['60.00', [Validators.required, Validators.min(0)]],
      status: ['pending', [Validators.required]],
      paymentMethod: [''],
      transactionId: ['']
    });
  }

  ngOnInit(): void {
    this.users$ = this.http.get<User[]>(`${environment.apiUrl}/users/admin/all`);
  }

  onSubmit(): void {
    if (this.cotisationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.cotisationForm.value;
      
      // Convert userId to number
      const cotisationData = {
        ...formValue,
        userId: +formValue.userId,
        year: +formValue.year,
        amount: parseFloat(formValue.amount)
      };

      this.http.post(`${environment.apiUrl}/cotisations`, cotisationData)
        .subscribe({
          next: () => {
            this.notification.showSuccess('Cotisation ajoutée avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.notification.showError(error.error?.message || 'Erreur lors de l\'ajout de la cotisation');
            this.isSubmitting = false;
          }
        });
    }
  }
}









