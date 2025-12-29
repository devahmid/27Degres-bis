import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService, DeliveryMethod } from '../../../core/services/orders.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-delivery-method-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 max-w-2xl">
      <h2 class="text-2xl font-bold mb-6 text-dark">
        {{ data?.method ? 'Modifier la méthode de livraison' : 'Ajouter une méthode de livraison' }}
      </h2>

      <form [formGroup]="methodForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Name -->
        <div>
          <label class="block text-dark font-medium mb-2">Nom *</label>
          <input 
            type="text" 
            formControlName="name" 
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Ex: Livraison standard">
          <div *ngIf="methodForm.get('name')?.hasError('required') && methodForm.get('name')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le nom est requis
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-dark font-medium mb-2">Description</label>
          <textarea 
            formControlName="description" 
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Description de la méthode de livraison"></textarea>
        </div>

        <!-- Cost -->
        <div>
          <label class="block text-dark font-medium mb-2">Coût (€) *</label>
          <input 
            type="number" 
            formControlName="cost" 
            required 
            min="0" 
            step="0.01"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="0.00">
          <div *ngIf="methodForm.get('cost')?.hasError('required') && methodForm.get('cost')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le coût est requis
          </div>
          <div *ngIf="methodForm.get('cost')?.hasError('min') && methodForm.get('cost')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le coût doit être positif
          </div>
        </div>

        <!-- Estimated Days -->
        <div>
          <label class="block text-dark font-medium mb-2">Délai estimé (jours)</label>
          <input 
            type="number" 
            formControlName="estimatedDays" 
            min="1"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Ex: 3">
        </div>

        <!-- Is Active -->
        <div class="flex items-center">
          <input 
            type="checkbox" 
            formControlName="isActive"
            id="isActive"
            class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
          <label for="isActive" class="ml-2 text-gray-700">
            Méthode active (visible pour les clients)
          </label>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4 pt-4">
          <button 
            type="button"
            (click)="onCancel()"
            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button 
            type="submit"
            [disabled]="!methodForm.valid"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ data?.method ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AddDeliveryMethodDialogComponent implements OnInit {
  methodForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDeliveryMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { method?: DeliveryMethod } | null | undefined,
    private ordersService: OrdersService,
    private notification: NotificationService
  ) {
    this.methodForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      cost: [0, [Validators.required, Validators.min(0)]],
      estimatedDays: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data?.method) {
      this.isEditMode = true;
      const method = this.data.method;
      this.methodForm.patchValue({
        name: method.name,
        description: method.description || '',
        cost: method.cost,
        estimatedDays: method.estimatedDays || null,
        isActive: method.isActive
      });
    }
  }

  onSubmit(): void {
    if (this.methodForm.valid) {
      const formValue = this.methodForm.value;
      
      if (this.isEditMode && this.data?.method) {
        this.ordersService.updateDeliveryMethod(this.data.method.id, formValue).subscribe({
          next: () => {
            this.notification.showSuccess('Méthode de livraison modifiée avec succès');
            this.dialogRef.close(true);
          },
          error: () => {
            this.notification.showError('Erreur lors de la modification');
          }
        });
      } else {
        this.ordersService.createDeliveryMethod(formValue).subscribe({
          next: () => {
            this.notification.showSuccess('Méthode de livraison créée avec succès');
            this.dialogRef.close(true);
          },
          error: () => {
            this.notification.showError('Erreur lors de la création');
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

