import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Event } from '../../../core/services/events.service';

export interface EventImage {
  id: number;
  eventId: number;
  event?: {
    title: string;
  };
  imageUrl: string;
  caption?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-manage-event-images-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DateFormatPipe
  ],
  template: `
    <div class="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-dark">Gérer les images - {{ data.title }}</h2>
      
      <!-- Upload Section -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Ajouter une image</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onUploadImage()" class="space-y-4">
            <div>
              <label class="block text-dark font-medium mb-2">Légende (optionnel)</label>
              <input 
                type="text" 
                [(ngModel)]="imageCaption"
                name="caption"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Ex: Photo du groupe lors du weekend">
            </div>

            <div>
              <label class="block text-dark font-medium mb-2">Image *</label>
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
            </div>

            <div class="flex justify-end">
              <button 
                type="submit" 
                mat-raised-button 
                color="primary"
                [disabled]="!selectedFile || isUploading">
                <mat-icon *ngIf="!isUploading" class="mr-2">cloud_upload</mat-icon>
                <span>{{ isUploading ? 'Upload en cours...' : 'Ajouter l' + 'image' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Images Gallery -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Images de l'événement ({{ (images$ | async)?.length || 0 }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="images$ | async as images; else loadingImages">
            <div *ngIf="images.length > 0; else noImages" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let image of images" class="relative group">
                <img [src]="image.imageUrl" [alt]="image.caption || 'Photo événement'" 
                     class="w-full h-48 object-cover rounded-lg">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button mat-icon-button (click)="deleteImage(image)" class="text-white">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                <p *ngIf="image.caption" class="mt-2 text-sm text-gray-600">{{ image.caption }}</p>
                <p class="text-xs text-gray-400">{{ image.createdAt | dateFormat }}</p>
              </div>
            </div>
            <ng-template #noImages>
              <p class="text-center text-gray-500 py-8">Aucune image pour cet événement</p>
            </ng-template>
          </div>
          <ng-template #loadingImages>
            <p class="text-center text-gray-500 py-8">Chargement des images...</p>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <div class="flex justify-end mt-6">
        <button mat-button (click)="dialogRef.close(false)">Fermer</button>
      </div>
    </div>
  `,
  styles: []
})
export class ManageEventImagesDialogComponent implements OnInit {
  images$!: Observable<EventImage[]>;
  selectedFile: File | null = null;
  imageCaption = '';
  isUploading = false;

  constructor(
    public dialogRef: MatDialogRef<ManageEventImagesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event,
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.images$ = this.http.get<EventImage[]>(`${environment.apiUrl}/events/${this.data.id}/images`);
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
      if (!file.type.startsWith('image/')) {
        this.notification.showError('Veuillez sélectionner un fichier image');
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

  onUploadImage(): void {
    if (!this.selectedFile || this.isUploading) {
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    if (this.imageCaption.trim()) {
      formData.append('caption', this.imageCaption.trim());
    }

    this.http.post(`${environment.apiUrl}/events/${this.data.id}/images`, formData).subscribe({
      next: () => {
        this.notification.showSuccess('Image ajoutée avec succès !');
        this.selectedFile = null;
        this.imageCaption = '';
        this.isUploading = false;
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        this.loadImages();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Erreur lors de l\'upload de l\'image';
        this.notification.showError(errorMessage);
        this.isUploading = false;
      }
    });
  }

  deleteImage(image: EventImage): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette image ?`)) {
      this.http.delete(`${environment.apiUrl}/events/images/${image.id}`).subscribe({
        next: () => {
          this.notification.showSuccess('Image supprimée avec succès !');
          this.loadImages();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Erreur lors de la suppression de l\'image';
          this.notification.showError(errorMessage);
        }
      });
    }
  }
}

