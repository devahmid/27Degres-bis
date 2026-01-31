import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventsService, Event } from '../../../core/services/events.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-add-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    RichTextEditorComponent
  ],
  template: `
    <div class="p-6 max-w-3xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-dark">
        {{ data ? 'Modifier l' + 'événement' : 'Ajouter un nouvel événement' }}
      </h2>
      
      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-dark font-medium mb-2">Titre *</label>
          <input 
            type="text" 
            formControlName="title" 
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Ex: Weekend LDC 2025">
          <div *ngIf="eventForm.get('title')?.hasError('required') && eventForm.get('title')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le titre est requis
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Description</label>
          <app-rich-text-editor formControlName="description"></app-rich-text-editor>
          <p class="text-sm text-gray-500 mt-2">
            <mat-icon class="text-sm align-middle">info</mat-icon>
            Utilisez la barre d'outils pour formater votre texte (gras, italique, listes, etc.)
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Type</label>
            <select 
              formControlName="type"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
              <option value="">Sélectionner un type</option>
              <option value="weekend">Weekend</option>
              <option value="reunion">Réunion</option>
              <option value="activite">Activité</option>
            </select>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Statut</label>
            <select 
              formControlName="status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Date de début *</label>
            <input 
              type="datetime-local" 
              formControlName="startDate" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
            <div *ngIf="eventForm.get('startDate')?.hasError('required') && eventForm.get('startDate')?.touched" 
                 class="text-red-500 text-sm mt-1">
              La date de début est requise
            </div>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Date de fin</label>
            <input 
              type="datetime-local" 
              formControlName="endDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Lieu</label>
            <input 
              type="text" 
              formControlName="location"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: Lac de Chalain, Jura">
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Nombre maximum de participants</label>
            <input 
              type="number" 
              formControlName="maxParticipants"
              min="1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: 50">
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Image principale</label>
          <input 
            type="file" 
            #fileInput
            (change)="onFileSelected($event)"
            accept="image/*"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer">
          <p *ngIf="selectedFile" class="mt-2 text-sm text-gray-600">
            <mat-icon class="align-middle text-sm">image</mat-icon>
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
          <p *ngIf="data?.featuredImage && !selectedFile" class="mt-2 text-sm text-gray-600">
            Image actuelle : <a [href]="data?.featuredImage" target="_blank" class="text-primary hover:underline">Voir</a>
          </p>
        </div>

        <div class="flex justify-end space-x-4 pt-4">
          <button mat-button type="button" (click)="dialogRef.close(false)">Annuler</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="eventForm.invalid || isSubmitting">
            <mat-icon *ngIf="!isSubmitting">{{ data ? 'save' : 'add' }}</mat-icon>
            <span>{{ isSubmitting ? 'Enregistrement...' : (data ? 'Enregistrer' : 'Ajouter l' + 'événement') }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AddEventDialogComponent implements OnInit {
  eventForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    private eventsService: EventsService,
    private notification: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: Event | null
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      description: [''],
      type: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      location: [''],
      maxParticipants: [''],
      status: ['draft'],
      featuredImage: ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      // Générer le slug à partir du titre si non fourni
      const slug = this.data.slug || this.generateSlug(this.data.title);
      
      // Convertir les dates au format datetime-local
      const startDate = this.formatDateForInput(this.data.startDate);
      const endDate = this.data.endDate ? this.formatDateForInput(this.data.endDate) : '';

      this.eventForm.patchValue({
        title: this.data.title,
        slug: slug,
        description: this.data.description || '',
        type: this.data.type || '',
        startDate: startDate,
        endDate: endDate,
        location: this.data.location || '',
        maxParticipants: this.data.maxParticipants || '',
        status: this.data.status || 'draft'
      });
    }
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.notification.showError('Le fichier est trop volumineux. Taille maximale : 10MB');
        event.target.value = '';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
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
    if (this.eventForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.eventForm.value;
      
      // Générer le slug si non fourni
      if (!formValue.slug) {
        formValue.slug = this.generateSlug(formValue.title);
      }

      // Convertir les dates en ISO string
      const eventData: any = {
        ...formValue,
        startDate: new Date(formValue.startDate).toISOString(),
      };

      if (formValue.endDate) {
        eventData.endDate = new Date(formValue.endDate).toISOString();
      }

      // Nettoyer les valeurs vides
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === '' || eventData[key] === null) {
          delete eventData[key];
        }
      });

      if (this.data) {
        // Mise à jour
        this.eventsService.updateEvent(this.data.id, eventData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.notification.showSuccess('Événement modifié avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = Array.isArray(error.error?.message)
              ? error.error.message.join(', ')
              : error.error?.message || 'Erreur lors de la modification de l\'événement';
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
      } else {
        // Création
        this.eventsService.createEvent(eventData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.notification.showSuccess('Événement créé avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = Array.isArray(error.error?.message)
              ? error.error.message.join(', ')
              : error.error?.message || 'Erreur lors de la création de l\'événement';
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

