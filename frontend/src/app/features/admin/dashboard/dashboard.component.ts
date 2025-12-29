import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DocumentsService, Document } from '../../../core/services/documents.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { User } from '../../../core/models/user.model';
import { OrdersService } from '../../../core/services/orders.service';

interface AdminStatistics {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  cotisations: {
    total: number;
    currentYear: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatMenuModule,
    DateFormatPipe
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2 text-dark">Tableau de bord Administrateur</h1>
        <p class="text-gray-600">Vue d'ensemble de l'association</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Members -->
        <mat-card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm mb-1">Total Membres</p>
                <p class="text-3xl font-bold">{{ (stats$ | async)?.users?.total || 0 }}</p>
              </div>
              <mat-icon class="text-5xl opacity-50">people</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Active Members -->
        <mat-card class="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm mb-1">Membres Actifs</p>
                <p class="text-3xl font-bold">{{ (stats$ | async)?.users?.active || 0 }}</p>
              </div>
              <mat-icon class="text-5xl opacity-50">check_circle</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Cotisations Current Year -->
        <mat-card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm mb-1">Cotisations {{ currentYear }}</p>
                <p class="text-3xl font-bold">{{ (stats$ | async)?.cotisations?.currentYear || 0 }}</p>
              </div>
              <mat-icon class="text-5xl opacity-50">credit_card</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Paid Amount -->
        <mat-card class="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm mb-1">Montant Collecté</p>
                <p class="text-2xl font-bold">{{ (stats$ | async)?.cotisations?.paidAmount || 0 | number:'1.2-2' }} €</p>
              </div>
              <mat-icon class="text-5xl opacity-50">euro</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Shop Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" *ngIf="shopStats$ | async as shopStats">
        <!-- Total Orders -->
        <mat-card class="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-indigo-100 text-sm mb-1">Total Commandes</p>
                <p class="text-3xl font-bold">{{ shopStats.totalOrders || 0 }}</p>
              </div>
              <mat-icon class="text-5xl opacity-50">shopping_cart</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Total Revenue -->
        <mat-card class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-emerald-100 text-sm mb-1">Chiffre d'Affaires</p>
                <p class="text-2xl font-bold">{{ shopStats.totalRevenue | number:'1.2-2' }} €</p>
              </div>
              <mat-icon class="text-5xl opacity-50">euro</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Pending Orders -->
        <mat-card class="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-amber-100 text-sm mb-1">Commandes en attente</p>
                <p class="text-3xl font-bold">{{ shopStats.pendingOrders || 0 }}</p>
              </div>
              <mat-icon class="text-5xl opacity-50">schedule</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Products Sold -->
        <mat-card class="bg-gradient-to-br from-rose-500 to-rose-600 text-white">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-rose-100 text-sm mb-1">Produits vendus</p>
                <p class="text-3xl font-bold">{{ shopStats.totalProductsSold || 0 }}</p>
              </div>
              <mat-icon class="text-5xl opacity-50">inventory</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Actions Rapides</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-2 gap-4">
              <button mat-raised-button color="primary" routerLink="/admin/members" class="w-full">
                <mat-icon class="mr-2">people</mat-icon>
                Gérer les Membres
              </button>
              <button mat-raised-button color="accent" routerLink="/admin/cotisations" class="w-full">
                <mat-icon class="mr-2">credit_card</mat-icon>
                Gérer les Cotisations
              </button>
              <button mat-stroked-button routerLink="/admin/events" class="w-full">
                <mat-icon class="mr-2">event</mat-icon>
                Gérer les Événements
              </button>
              <button mat-stroked-button routerLink="/admin/posts" class="w-full">
                <mat-icon class="mr-2">article</mat-icon>
                Gérer les Actualités
              </button>
              <button mat-stroked-button routerLink="/admin/comments" class="w-full">
                <mat-icon class="mr-2">comment</mat-icon>
                Gérer les Commentaires
              </button>
              <button mat-stroked-button routerLink="/admin/orders" class="w-full">
                <mat-icon class="mr-2">shopping_cart</mat-icon>
                Gérer les Commandes
              </button>
              <button mat-stroked-button routerLink="/admin/products" class="w-full">
                <mat-icon class="mr-2">shopping_bag</mat-icon>
                Gérer la Boutique
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Cotisations Status -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Statut des Cotisations {{ currentYear }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div class="flex items-center">
                  <mat-icon class="text-green-600 mr-2">check_circle</mat-icon>
                  <span class="text-gray-700">Payées</span>
                </div>
                <span class="font-bold text-green-600">{{ (stats$ | async)?.cotisations?.paid || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div class="flex items-center">
                  <mat-icon class="text-yellow-600 mr-2">schedule</mat-icon>
                  <span class="text-gray-700">En attente</span>
                </div>
                <span class="font-bold text-yellow-600">{{ (stats$ | async)?.cotisations?.pending || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div class="flex items-center">
                  <mat-icon class="text-red-600 mr-2">warning</mat-icon>
                  <span class="text-gray-700">En retard</span>
                </div>
                <span class="font-bold text-red-600">{{ (stats$ | async)?.cotisations?.overdue || 0 }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Members by Role -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Répartition par Rôle</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg" *ngFor="let role of getRoles()">
              <p class="text-2xl font-bold text-primary">{{ (stats$ | async)?.users?.byRole?.[role] || 0 }}</p>
              <p class="text-sm text-gray-600 capitalize">{{ role }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Documents List Section -->
      <mat-card class="mt-8">
        <mat-card-header>
          <div class="flex items-center justify-between w-full">
            <mat-card-title>Documents récents</mat-card-title>
            <button mat-button color="primary" routerLink="/member/documents">
              <mat-icon class="mr-1">list</mat-icon>
              Voir tous les documents
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="documents$ | async as documents; else loadingDocuments">
            <div *ngIf="documents.length > 0; else noDocuments">
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="documents" class="w-full">
                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Titre</th>
                    <td mat-cell *matCellDef="let doc">
                      <div class="flex items-center">
                        <mat-icon class="mr-2 text-gray-400">{{ getFileIcon(doc.fileType) }}</mat-icon>
                        <span>{{ doc.title }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="category">
                    <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                    <td mat-cell *matCellDef="let doc">
                      <span class="px-2 py-1 bg-gray-100 rounded text-sm">{{ doc.category || 'Général' }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="assignedTo">
                    <th mat-header-cell *matHeaderCellDef>Assigné à</th>
                    <td mat-cell *matCellDef="let doc">
                      <span *ngIf="doc.assignedToUser" class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {{ doc.assignedToUser.firstName }} {{ doc.assignedToUser.lastName }}
                      </span>
                      <span *ngIf="!doc.assignedToUser" class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        Général
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let doc">{{ doc.createdAt | dateFormat }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let doc">
                      <button mat-icon-button [matMenuTriggerFor]="menu" type="button">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu" [hasBackdrop]="false">
                        <button mat-menu-item (click)="downloadDocument(doc)">
                          <mat-icon>download</mat-icon>
                          <span>Télécharger</span>
                        </button>
                        <button mat-menu-item (click)="deleteDocument(doc)" class="text-red-600">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['title', 'category', 'assignedTo', 'createdAt', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['title', 'category', 'assignedTo', 'createdAt', 'actions'];"></tr>
                </table>
              </div>
            </div>
            <ng-template #noDocuments>
              <p class="text-center text-gray-500 py-8">Aucun document disponible</p>
            </ng-template>
          </div>
          <ng-template #loadingDocuments>
            <p class="text-center text-gray-500 py-8">Chargement des documents...</p>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <!-- Upload Document Section -->
      <mat-card class="mt-8">
        <mat-card-header>
          <mat-card-title>Ajouter un Document</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onUploadDocument()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-dark font-medium mb-2">Titre du document *</label>
                <input 
                  type="text" 
                  [(ngModel)]="documentForm.title" 
                  name="title"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Ex: Statuts de l'association">
              </div>

              <div>
                <label class="block text-dark font-medium mb-2">Catégorie</label>
                <select 
                  [(ngModel)]="documentForm.category" 
                  name="category"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                  <option value="">Sélectionner une catégorie</option>
                  <option value="general">Général</option>
                  <option value="statuts">Statuts</option>
                  <option value="comptabilite">Comptabilité</option>
                  <option value="assemblee">Assemblée</option>
                  <option value="recu">Reçu</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-dark font-medium mb-2">Assigner à un membre (optionnel)</label>
              <p class="text-sm text-gray-600 mb-2">Ex: Reçu de cotisation, document personnel, etc.</p>
              <select 
                [(ngModel)]="documentForm.assignedToUserId" 
                name="assignedToUserId"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                <option [value]="undefined">Aucun membre (document général)</option>
                <option *ngFor="let user of (users$ | async)" [value]="user.id">
                  {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-dark font-medium mb-2">Description</label>
              <textarea 
                [(ngModel)]="documentForm.description" 
                name="description"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Description du document (optionnel)"></textarea>
            </div>

            <div>
              <label class="block text-dark font-medium mb-2">Fichier *</label>
              <div class="flex items-center space-x-4">
                <input 
                  type="file" 
                  #fileInput
                  (change)="onFileSelected($event)"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.csv"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer">
              </div>
              <p *ngIf="selectedFile" class="mt-2 text-sm text-gray-600">
                <mat-icon class="align-middle text-sm">attach_file</mat-icon>
                {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
              </p>
            </div>

            <div class="flex justify-end space-x-4">
              <button 
                type="button" 
                mat-stroked-button 
                (click)="resetForm()"
                [disabled]="isUploading">
                Annuler
              </button>
              <button 
                type="submit" 
                mat-raised-button 
                color="primary"
                [disabled]="!canUpload() || isUploading">
                <mat-icon *ngIf="!isUploading" class="mr-2">cloud_upload</mat-icon>
                <span>{{ isUploading ? 'Upload en cours...' : 'Uploader le document' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  stats$!: Observable<AdminStatistics>;
  shopStats$!: Observable<any>;;
  documents$!: Observable<Document[]>;
  users$!: Observable<User[]>;
  currentYear = new Date().getFullYear();
  
  selectedFile: File | null = null;
  isUploading = false;
  documentForm = {
    title: '',
    description: '',
    category: '',
    assignedToUserId: undefined as number | undefined
  };
  documentColumns: string[] = ['title', 'category', 'createdAt', 'actions'];

  constructor(
    private http: HttpClient,
    private documentsService: DocumentsService,
    private notification: NotificationService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadDocuments();
    this.loadUsers();
    this.loadShopStatistics();
  }

  loadShopStatistics(): void {
    this.shopStats$ = this.ordersService.getStatistics();
  }

  loadUsers(): void {
    this.users$ = this.http.get<User[]>(`${environment.apiUrl}/users/admin/all`);
  }

  loadStatistics(): void {
    // Load users statistics
    const usersStats$ = this.http.get<any>(`${environment.apiUrl}/users/admin/statistics`);
    // Load cotisations statistics
    const cotisationsStats$ = this.http.get<any>(`${environment.apiUrl}/cotisations/admin/statistics`);
    
    // Combine both observables
    this.stats$ = combineLatest([usersStats$, cotisationsStats$]).pipe(
      map(([users, cotisations]) => ({ users, cotisations }))
    );
  }

  loadDocuments(): void {
    // Charger les 10 derniers documents
    this.documents$ = this.documentsService.getDocuments().pipe(
      map(docs => docs.slice(0, 10)) // Limiter à 10 documents récents
    );
  }

  getRoles(): string[] {
    return ['admin', 'bureau', 'membre', 'visiteur'];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.notification.showError('Le fichier est trop volumineux. Taille maximale : 10MB');
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  canUpload(): boolean {
    return !!(this.selectedFile && this.documentForm.title.trim());
  }

  onUploadDocument(): void {
    if (!this.canUpload() || this.isUploading) {
      return;
    }

    this.isUploading = true;

    this.documentsService.uploadDocument(
      this.selectedFile!,
      this.documentForm.title.trim(),
      this.documentForm.description.trim() || undefined,
      this.documentForm.category || undefined,
      this.documentForm.assignedToUserId
    ).subscribe({
      next: (document) => {
        this.notification.showSuccess(`Document "${document.title}" uploadé avec succès !`);
        this.resetForm();
        this.loadDocuments(); // Recharger la liste des documents
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
        const errorMessage = error.error?.message || 'Erreur lors de l\'upload du document';
        this.notification.showError(errorMessage);
        this.isUploading = false;
      }
    });
  }

  downloadDocument(document: Document): void {
    this.documentsService.downloadDocument(document.id);
  }

  deleteDocument(document: Document): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.title}" ?`)) {
      this.documentsService.deleteDocument(document.id).subscribe({
        next: () => {
          this.notification.showSuccess('Document supprimé avec succès !');
          this.loadDocuments(); // Recharger la liste des documents
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notification.showError('Erreur lors de la suppression du document');
        }
      });
    }
  }

  getFileIcon(fileType?: string): string {
    if (!fileType) return 'insert_drive_file';
    
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'description';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('text')) return 'text_snippet';
    
    return 'insert_drive_file';
  }

  resetForm(): void {
    this.selectedFile = null;
    this.documentForm = {
      title: '',
      description: '',
      category: '',
      assignedToUserId: undefined
    };
    this.isUploading = false;
    // Reset file input
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
}
