import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventsService, Event } from '../../../core/services/events.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-event-registration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="p-6 max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-bold text-dark mb-2">
            <span *ngIf="!isEditMode">Inscription à l'événement</span>
            <span *ngIf="isEditMode">Modifier mon inscription</span>
          </h2>
          <p class="text-gray-600 text-lg">{{ data.title }}</p>
        </div>
        <button mat-icon-button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Disponibilité -->
        <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <label class="block text-dark font-semibold mb-4 text-lg flex items-center gap-2">
            <mat-icon class="text-primary">schedule</mat-icon>
            Votre disponibilité <span class="text-red-500">*</span>
          </label>
          <mat-radio-group formControlName="availabilityType" class="flex flex-col gap-4">
            <mat-radio-button value="full" class="mb-2">
              <div class="ml-3 py-2">
                <span class="font-semibold text-dark block mb-1">Tout le weekend</span>
                <p class="text-sm text-gray-600">Je serai présent(e) pour toute la durée de l'événement</p>
              </div>
            </mat-radio-button>
            <mat-radio-button value="partial" class="mb-2">
              <div class="ml-3 py-2">
                <span class="font-semibold text-dark block mb-1">Présence partielle</span>
                <p class="text-sm text-gray-600">Je ne serai présent(e) que certains jours ou demi-journées</p>
              </div>
            </mat-radio-button>
          </mat-radio-group>
        </div>

        <!-- Détails de disponibilité (si partiel) -->
        <div *ngIf="registrationForm.get('availabilityType')?.value === 'partial'" class="bg-yellow-50 rounded-lg p-5 border border-yellow-200 animate-fade-in">
          <label class="block text-dark font-semibold mb-2 flex items-center gap-2">
            <mat-icon class="text-yellow-600">info</mat-icon>
            Précisez vos disponibilités <span class="text-red-500">*</span>
          </label>
          <textarea 
            formControlName="availabilityDetails"
            rows="3"
            required
            class="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            placeholder="Ex: Vendredi soir uniquement, Samedi matin et dimanche après-midi..."></textarea>
          <div *ngIf="registrationForm.get('availabilityDetails')?.hasError('required') && registrationForm.get('availabilityDetails')?.touched" 
               class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <mat-icon class="text-sm">error</mat-icon>
            Veuillez préciser vos disponibilités
          </div>
        </div>

        <!-- Volontariat -->
        <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <mat-checkbox formControlName="isVolunteer" class="mb-4">
            <span class="font-semibold text-dark text-lg flex items-center gap-2">
              <mat-icon class="text-primary">volunteer_activism</mat-icon>
              Je souhaite me porter volontaire pour aider
            </span>
          </mat-checkbox>
          
          <!-- Activités de volontariat -->
          <div *ngIf="registrationForm.get('isVolunteer')?.value" class="ml-8 mt-4 space-y-3 animate-fade-in">
            <label class="block text-dark font-semibold mb-3">Dans quelles activités pouvez-vous aider ?</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <mat-checkbox formControlName="volunteerCourses" class="bg-white p-2 rounded border border-gray-200">
                <span class="flex items-center gap-2">
                  <mat-icon class="text-sm">shopping_cart</mat-icon>
                  Courses / Achats
                </span>
              </mat-checkbox>
              <mat-checkbox formControlName="volunteerKeys" class="bg-white p-2 rounded border border-gray-200">
                <span class="flex items-center gap-2">
                  <mat-icon class="text-sm">vpn_key</mat-icon>
                  Récupération des clés
                </span>
              </mat-checkbox>
              <mat-checkbox formControlName="volunteerCooking" class="bg-white p-2 rounded border border-gray-200">
                <span class="flex items-center gap-2">
                  <mat-icon class="text-sm">restaurant</mat-icon>
                  Cuisine
                </span>
              </mat-checkbox>
              <mat-checkbox formControlName="volunteerSetup" class="bg-white p-2 rounded border border-gray-200">
                <span class="flex items-center gap-2">
                  <mat-icon class="text-sm">build</mat-icon>
                  Installation / Mise en place
                </span>
              </mat-checkbox>
              <mat-checkbox formControlName="volunteerCleaning" class="bg-white p-2 rounded border border-gray-200">
                <span class="flex items-center gap-2">
                  <mat-icon class="text-sm">cleaning_services</mat-icon>
                  Nettoyage
                </span>
              </mat-checkbox>
              <mat-checkbox formControlName="volunteerOther" class="bg-white p-2 rounded border border-gray-200">
                <span class="flex items-center gap-2">
                  <mat-icon class="text-sm">more_horiz</mat-icon>
                  Autre
                </span>
              </mat-checkbox>
            </div>
            <div *ngIf="registrationForm.get('volunteerOther')?.value" class="mt-3">
              <label class="block text-dark font-medium mb-2">Précisez</label>
              <input 
                type="text"
                formControlName="volunteerOtherDetails"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                placeholder="Décrivez comment vous pouvez aider...">
            </div>
          </div>
        </div>

        <!-- Notes additionnelles -->
        <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <label class="block text-dark font-semibold mb-2 flex items-center gap-2">
            <mat-icon class="text-primary">note</mat-icon>
            Notes additionnelles <span class="text-gray-500 text-sm font-normal">(optionnel)</span>
          </label>
          <textarea 
            formControlName="notes"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            placeholder="Informations complémentaires, allergies alimentaires, besoins spécifiques..."></textarea>
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
            [disabled]="registrationForm.invalid || isSubmitting"
            class="px-8 flex items-center gap-2">
            <mat-icon *ngIf="!isSubmitting">event_available</mat-icon>
            <mat-icon *ngIf="isSubmitting" class="animate-spin">refresh</mat-icon>
            <span *ngIf="!isSubmitting && !isEditMode">Confirmer l'inscription</span>
            <span *ngIf="!isSubmitting && isEditMode">Enregistrer les modifications</span>
            <span *ngIf="isSubmitting && !isEditMode">Inscription en cours...</span>
            <span *ngIf="isSubmitting && isEditMode">Modification en cours...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    
    ::ng-deep .mat-radio-button {
      margin-bottom: 8px;
    }
    
    ::ng-deep .mat-radio-button .mat-radio-label {
      white-space: normal;
    }
    
    ::ng-deep .mat-checkbox {
      margin-bottom: 8px;
    }
    
    ::ng-deep .mat-checkbox-label {
      white-space: normal;
    }
    
    ::ng-deep button[mat-raised-button][disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    ::ng-deep button[mat-raised-button][disabled] mat-icon {
      opacity: 0.6;
    }
  `]
})
export class EventRegistrationDialogComponent implements OnInit {
  registrationForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  registrationId?: number;

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<EventRegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event
  ) {
    this.registrationForm = this.fb.group({
      availabilityType: ['full', Validators.required],
      availabilityDetails: [''],
      isVolunteer: [false],
      volunteerCourses: [false],
      volunteerKeys: [false],
      volunteerCooking: [false],
      volunteerSetup: [false],
      volunteerCleaning: [false],
      volunteerOther: [false],
      volunteerOtherDetails: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Ajouter la validation conditionnelle pour availabilityDetails
    this.registrationForm.get('availabilityType')?.valueChanges.subscribe(value => {
      const detailsControl = this.registrationForm.get('availabilityDetails');
      if (value === 'partial') {
        detailsControl?.setValidators([Validators.required]);
      } else {
        detailsControl?.clearValidators();
        detailsControl?.setValue('');
      }
      detailsControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.registrationForm.value;
      
      // Construire le tableau des activités de volontariat
      const volunteerActivities: string[] = [];
      if (formValue.volunteerCourses) volunteerActivities.push('courses');
      if (formValue.volunteerKeys) volunteerActivities.push('keys');
      if (formValue.volunteerCooking) volunteerActivities.push('cooking');
      if (formValue.volunteerSetup) volunteerActivities.push('setup');
      if (formValue.volunteerCleaning) volunteerActivities.push('cleaning');
      if (formValue.volunteerOther) {
        volunteerActivities.push('other');
        if (formValue.volunteerOtherDetails) {
          volunteerActivities.push(`other:${formValue.volunteerOtherDetails}`);
        }
      }

      const registrationData = {
        availabilityType: formValue.availabilityType,
        availabilityDetails: formValue.availabilityType === 'partial' ? formValue.availabilityDetails : null,
        isVolunteer: formValue.isVolunteer || false,
        volunteerActivities: formValue.isVolunteer ? volunteerActivities : [],
        notes: formValue.notes || null
      };

      if (this.isEditMode && this.registrationId) {
        // Mode édition : mettre à jour l'inscription existante
        this.eventsService.updateRegistration(this.registrationId, registrationData).subscribe({
          next: () => {
            this.notification.showSuccess('Inscription modifiée avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Erreur lors de la modification de l\'inscription';
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
      } else {
        // Mode création : créer une nouvelle inscription
        this.eventsService.registerToEvent(this.data.id, registrationData).subscribe({
          next: () => {
            this.notification.showSuccess('Inscription réussie ! Merci pour votre participation.');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
