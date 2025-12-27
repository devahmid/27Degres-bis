import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { GalleryService, GalleryImage } from '../../../core/services/gallery.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-gallery-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-dark">
        {{ data?.image ? 'Modifier l' + 'image' : 'Ajouter une nouvelle image' }}
      </h2>
      
      <form [formGroup]="imageForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-dark font-medium mb-2">Image *</label>
          <input 
            type="file" 
            #fileInput
            (change)="onFileSelected($event)"
            accept="image/*"
            [required]="!data?.image"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer">
          <p *ngIf="selectedFile" class="mt-2 text-sm text-gray-600">
            <mat-icon class="align-middle text-sm">image</mat-icon>
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
          <p *ngIf="data?.image && !selectedFile" class="mt-2 text-sm text-gray-600">
            Image actuelle : <a [href]="data?.image?.imageUrl" target="_blank" class="text-primary hover:underline">Voir</a>
          </p>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Légende</label>
          <textarea 
            formControlName="caption" 
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Description de l'image"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Visibilité *</label>
            <select 
              formControlName="isPublic" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
              <option value="true">Publique</option>
              <option value="false">Privée</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Les images publiques sont visibles par tous. Les images privées sont uniquement visibles par vous et les administrateurs.
            </p>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Catégorie</label>
            <input 
              type="text" 
              formControlName="category"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: Événements, Membres, etc.">
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-4">
          <button mat-button type="button" (click)="dialogRef.close(false)">Annuler</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="imageForm.invalid || isSubmitting || (!selectedFile && !data?.image)">
            <mat-icon *ngIf="!isSubmitting">{{ data?.image ? 'save' : 'add' }}</mat-icon>
            <span>{{ isSubmitting ? 'Enregistrement...' : (data?.image ? 'Enregistrer' : 'Ajouter l' + 'image') }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AddGalleryImageDialogComponent implements OnInit {
  imageForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddGalleryImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image?: GalleryImage } | null | undefined,
    private galleryService: GalleryService,
    private notification: NotificationService
  ) {
    this.imageForm = this.fb.group({
      caption: [data?.image?.caption || ''],
      // Stocker comme string pour le select, puis convertir en boolean lors de la soumission
      isPublic: [data?.image?.isPublic !== undefined ? String(data.image.isPublic) : 'true', Validators.required],
      category: [data?.image?.category || ''],
    });
  }

  ngOnInit(): void {}

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
      if (!file.type.startsWith('image/')) {
        this.notification.showError('Veuillez sélectionner un fichier image');
        event.target.value = '';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
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
    if (this.imageForm.invalid) {
      this.imageForm.markAllAsTouched();
      this.notification.showError('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    if (!this.selectedFile && !this.data?.image) {
      this.notification.showError('Veuillez sélectionner une image.');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.imageForm.value;

    // S'assurer que isPublic est un boolean
    // Le select peut retourner une string "true"/"false" ou un boolean
    let isPublic: boolean;
    if (typeof formValue.isPublic === 'string') {
      isPublic = formValue.isPublic === 'true' || formValue.isPublic === '1';
    } else if (typeof formValue.isPublic === 'boolean') {
      isPublic = formValue.isPublic;
    } else {
      // Fallback: convertir en boolean
      isPublic = Boolean(formValue.isPublic);
    }
    
    console.log('Form value isPublic:', formValue.isPublic, 'Converted:', isPublic);

    if (this.data?.image) {
      // Update existing image
      this.galleryService.updateImage(
        this.data.image.id,
        formValue.caption || undefined,
        isPublic,
        formValue.category || undefined
      ).subscribe({
        next: () => {
          this.notification.showSuccess('Image mise à jour avec succès !');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notification.showError(err.error?.message || 'Erreur lors de la mise à jour de l\'image.');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new image
      this.galleryService.uploadImage(
        this.selectedFile!,
        formValue.caption || undefined,
        isPublic,
        formValue.category || undefined
      ).subscribe({
        next: () => {
          this.notification.showSuccess('Image ajoutée avec succès !');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notification.showError(err.error?.message || 'Erreur lors de l\'ajout de l\'image.');
          this.isSubmitting = false;
        }
      });
    }
  }
}
