import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostsService, Post } from '../../../core/services/posts.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-post-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-dark">
        {{ data ? 'Modifier l' + 'actualité' : 'Ajouter une nouvelle actualité' }}
      </h2>
      
      <form [formGroup]="postForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-dark font-medium mb-2">Titre *</label>
          <input 
            type="text" 
            formControlName="title" 
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Ex: Weekend LDC 2024 : Un Moment Inoubliable">
          <div *ngIf="postForm.get('title')?.hasError('required') && postForm.get('title')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le titre est requis
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Extrait</label>
          <textarea 
            formControlName="excerpt"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Court résumé de l'actualité (affiché dans la liste)"></textarea>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Contenu *</label>
          <textarea 
            formControlName="content"
            rows="10"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Contenu complet de l'actualité"></textarea>
          <div *ngIf="postForm.get('content')?.hasError('required') && postForm.get('content')?.touched" 
               class="text-red-500 text-sm mt-1">
            Le contenu est requis
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-dark font-medium mb-2">Catégorie</label>
            <select 
              formControlName="category"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
              <option value="">Sélectionner une catégorie</option>
              <option value="Événements">Événements</option>
              <option value="Vie associative">Vie associative</option>
              <option value="Partenariats">Partenariats</option>
              <option value="Témoignages">Témoignages</option>
              <option value="Communauté">Communauté</option>
            </select>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Statut</label>
            <select 
              formControlName="status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-dark font-medium mb-2">Date de publication</label>
          <input 
            type="datetime-local" 
            formControlName="publishDate"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
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
          <button mat-raised-button color="primary" type="submit" [disabled]="postForm.invalid || isSubmitting">
            <mat-icon *ngIf="!isSubmitting">{{ data ? 'save' : 'add' }}</mat-icon>
            <span>{{ isSubmitting ? 'Enregistrement...' : (data ? 'Enregistrer' : 'Ajouter l' + 'actualité') }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AddPostDialogComponent implements OnInit {
  postForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddPostDialogComponent>,
    private postsService: PostsService,
    private notification: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: Post | null
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      excerpt: [''],
      content: ['', Validators.required],
      category: [''],
      status: ['draft'],
      publishDate: [''],
      featuredImage: ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      // Générer le slug à partir du titre si non fourni
      const slug = this.data.slug || this.generateSlug(this.data.title);
      
      // Convertir la date au format datetime-local
      const publishDate = this.data.publishDate ? this.formatDateForInput(this.data.publishDate) : '';

      this.postForm.patchValue({
        title: this.data.title,
        slug: slug,
        excerpt: this.data.excerpt || '',
        content: this.data.content,
        category: this.data.category || '',
        status: this.data.status || 'draft',
        publishDate: publishDate
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
    if (this.postForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.postForm.value;
      
      // Générer le slug si non fourni
      if (!formValue.slug) {
        formValue.slug = this.generateSlug(formValue.title);
      }

      // Convertir la date en ISO string si fournie
      const postData: any = { ...formValue };
      if (formValue.publishDate) {
        postData.publishDate = new Date(formValue.publishDate).toISOString();
      }

      // Nettoyer les valeurs vides
      Object.keys(postData).forEach(key => {
        if (postData[key] === '' || postData[key] === null) {
          delete postData[key];
        }
      });

      if (this.data) {
        // Mise à jour
        this.postsService.updatePost(this.data.id, postData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.notification.showSuccess('Actualité modifiée avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = Array.isArray(error.error?.message)
              ? error.error.message.join(', ')
              : error.error?.message || 'Erreur lors de la modification de l\'actualité';
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
      } else {
        // Création
        this.postsService.createPost(postData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.notification.showSuccess('Actualité créée avec succès !');
            this.dialogRef.close(true);
          },
          error: (error) => {
            const errorMessage = Array.isArray(error.error?.message)
              ? error.error.message.join(', ')
              : error.error?.message || 'Erreur lors de la création de l\'actualité';
            this.notification.showError(errorMessage);
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

