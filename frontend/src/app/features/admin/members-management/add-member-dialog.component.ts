import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-member-dialog',
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
      <h2 class="text-2xl font-bold mb-6 text-dark">Ajouter un nouveau membre</h2>
      
      <form [formGroup]="memberForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Prénom *</label>
            <input 
              type="text" 
              formControlName="firstName" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Jean">
            <div *ngIf="memberForm.get('firstName')?.hasError('required') && memberForm.get('firstName')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Le prénom est requis
            </div>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Nom *</label>
            <input 
              type="text" 
              formControlName="lastName" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Dupont">
            <div *ngIf="memberForm.get('lastName')?.hasError('required') && memberForm.get('lastName')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Le nom est requis
            </div>
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Email *</label>
          <input 
            type="email" 
            formControlName="email" 
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="jean.dupont@example.com">
          <div *ngIf="memberForm.get('email')?.hasError('required') && memberForm.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
            L'email est requis
          </div>
          <div *ngIf="memberForm.get('email')?.hasError('email') && memberForm.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
            Email invalide
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Mot de passe *</label>
          <input 
            type="password" 
            formControlName="password" 
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="••••••••">
          <div *ngIf="memberForm.get('password')?.hasError('required') && memberForm.get('password')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le mot de passe est requis
          </div>
          <div *ngIf="memberForm.get('password')?.hasError('minlength') && memberForm.get('password')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le mot de passe doit contenir au moins 6 caractères
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Téléphone</label>
            <input 
              type="tel" 
              formControlName="phone"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="06 12 34 56 78">
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Rôle *</label>
            <select 
              formControlName="role"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
              <option value="membre">Membre</option>
              <option value="bureau">Bureau</option>
              <option value="admin">Administrateur</option>
              <option value="visiteur">Visiteur</option>
            </select>
            <div *ngIf="memberForm.get('role')?.hasError('required') && memberForm.get('role')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Le rôle est requis
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Rue</label>
            <input 
              type="text" 
              formControlName="addressStreet"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="123 Rue de la République">
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Ville</label>
            <input 
              type="text" 
              formControlName="addressCity"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Paris">
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Code postal</label>
            <input 
              type="text" 
              formControlName="addressPostalCode"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="75001">
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              formControlName="consentAnnuaire"
              class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
            <span class="ml-2 text-gray-700">Visible dans l'annuaire</span>
          </label>
          <label class="flex items-center">
            <input 
              type="checkbox" 
              formControlName="consentNewsletter"
              class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
            <span class="ml-2 text-gray-700">Recevoir la newsletter</span>
          </label>
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
            [disabled]="memberForm.invalid || isSubmitting"
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
export class AddMemberDialogComponent {
  memberForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<AddMemberDialogComponent>
  ) {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      role: ['membre', [Validators.required]],
      addressStreet: [''],
      addressCity: [''],
      addressPostalCode: [''],
      consentAnnuaire: [false],
      consentNewsletter: [false]
    });
  }

  onSubmit(): void {
    if (this.memberForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      // Clean up form data - remove empty strings and convert to proper types
      const formValue = this.memberForm.value;
      const cleanedData: any = {
        firstName: formValue.firstName?.trim(),
        lastName: formValue.lastName?.trim(),
        email: formValue.email?.trim(),
        password: formValue.password,
        role: formValue.role || 'membre',
        consentAnnuaire: formValue.consentAnnuaire === true,
        consentNewsletter: formValue.consentNewsletter === true
      };
      
      // Only include optional fields if they have non-empty values
      if (formValue.phone?.trim()) {
        cleanedData.phone = formValue.phone.trim();
      }
      if (formValue.addressStreet?.trim()) {
        cleanedData.addressStreet = formValue.addressStreet.trim();
      }
      if (formValue.addressCity?.trim()) {
        cleanedData.addressCity = formValue.addressCity.trim();
      }
      if (formValue.addressPostalCode?.trim()) {
        cleanedData.addressPostalCode = formValue.addressPostalCode.trim();
      }
      
      console.log('Sending data:', cleanedData); // Debug log
      
      this.http.post(`${environment.apiUrl}/users`, cleanedData)
        .subscribe({
          next: () => {
            this.notification.showSuccess('Membre ajouté avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = Array.isArray(error.error?.message) 
              ? error.error.message.join(', ') 
              : (error.error?.message || 'Erreur lors de l\'ajout du membre');
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
    }
  }
}

