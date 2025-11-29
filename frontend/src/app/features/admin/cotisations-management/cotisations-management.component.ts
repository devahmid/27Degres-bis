import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddCotisationDialogComponent } from './add-cotisation-dialog.component';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cotisation } from '../../../core/models/cotisation.model';
import { NotificationService } from '../../../core/services/notification.service';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

interface CotisationWithUser extends Cotisation {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Component({
  selector: 'app-cotisations-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule,
    FormsModule,
    BadgeStatusComponent,
    DateFormatPipe
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-4xl font-bold mb-2 text-dark">Gestion des Cotisations</h1>
          <p class="text-gray-600">Gérez toutes les cotisations de l'association</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon class="mr-2">add</mat-icon>
          Ajouter une cotisation
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-6">
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-dark font-medium mb-2">Année</label>
              <select 
                [(ngModel)]="filterYear" 
                (ngModelChange)="onFilterChange()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                <option value="">Toutes</option>
                <option [value]="currentYear">{{ currentYear }}</option>
                <option [value]="currentYear - 1">{{ currentYear - 1 }}</option>
                <option [value]="currentYear - 2">{{ currentYear - 2 }}</option>
              </select>
            </div>
            <div>
              <label class="block text-dark font-medium mb-2">Statut</label>
              <select 
                [(ngModel)]="filterStatus" 
                (ngModelChange)="onFilterChange()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                <option value="">Tous</option>
                <option value="paid">Payées</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
            <div>
              <label class="block text-dark font-medium mb-2">Rechercher</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="searchTerm" 
                  (ngModelChange)="onFilterChange()" 
                  placeholder="Nom, email..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Cotisations Table -->
      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="filteredCotisations$" class="w-full">
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>Membre</th>
              <td mat-cell *matCellDef="let cotisation">
                <div *ngIf="cotisation.user">
                  <p class="font-medium">{{ cotisation.user.firstName }} {{ cotisation.user.lastName }}</p>
                  <p class="text-sm text-gray-500">{{ cotisation.user.email }}</p>
                </div>
                <span *ngIf="!cotisation.user" class="text-gray-400">N/A</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="year">
              <th mat-header-cell *matHeaderCellDef>Année</th>
              <td mat-cell *matCellDef="let cotisation">{{ cotisation.year }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Montant</th>
              <td mat-cell *matCellDef="let cotisation" class="font-semibold">{{ cotisation.amount }} €</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let cotisation">
                <app-badge-status [status]="cotisation.status"></app-badge-status>
              </td>
            </ng-container>

            <ng-container matColumnDef="paymentDate">
              <th mat-header-cell *matHeaderCellDef>Date de paiement</th>
              <td mat-cell *matCellDef="let cotisation">
                {{ cotisation.paymentDate ? (cotisation.paymentDate | dateFormat) : '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let cotisation">
                <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{cotisation: cotisation}" type="button">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Menu défini une seule fois en dehors du tableau -->
          <mat-menu #menu="matMenu" [hasBackdrop]="false">
            <ng-template matMenuContent let-cotisation="cotisation">
              <button mat-menu-item (click)="updateStatus(cotisation, 'paid')" *ngIf="cotisation.status !== 'paid'">
                <mat-icon>check_circle</mat-icon>
                <span>Marquer comme payée</span>
              </button>
              <button mat-menu-item (click)="updateStatus(cotisation, 'pending')" *ngIf="cotisation.status !== 'pending'">
                <mat-icon>schedule</mat-icon>
                <span>Marquer en attente</span>
              </button>
              <button mat-menu-item (click)="updateStatus(cotisation, 'overdue')" *ngIf="cotisation.status !== 'overdue'">
                <mat-icon>warning</mat-icon>
                <span>Marquer en retard</span>
              </button>
              <button mat-menu-item (click)="editCotisation(cotisation)">
                <mat-icon>edit</mat-icon>
                <span>Modifier</span>
              </button>
              <button mat-menu-item (click)="deleteCotisation(cotisation)" class="text-red-600">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </ng-template>
          </mat-menu>
          
          <div *ngIf="(filteredCotisations$ | async)?.length === 0" class="text-center py-8 text-gray-500">
            Aucune cotisation trouvée
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './cotisations-management.component.scss'
})
export class CotisationsManagementComponent implements OnInit {
  cotisations$!: Observable<CotisationWithUser[]>;
  filteredCotisations$!: Observable<CotisationWithUser[]>;
  searchTerm = '';
  filterYear = '';
  filterStatus = '';
  currentYear = new Date().getFullYear();
  displayedColumns: string[] = ['user', 'year', 'amount', 'status', 'paymentDate', 'actions'];

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCotisations();
  }

  loadCotisations(): void {
    const url = this.filterYear 
      ? `${environment.apiUrl}/cotisations/admin/all?year=${this.filterYear}`
      : `${environment.apiUrl}/cotisations/admin/all`;
    
    this.cotisations$ = this.http.get<CotisationWithUser[]>(url);
    this.filteredCotisations$ = this.cotisations$;
  }

  onFilterChange(): void {
    if (this.filterYear) {
      this.loadCotisations();
    } else {
      this.filteredCotisations$ = this.cotisations$.pipe(
        map(cotisations => {
          let filtered = [...cotisations];
          
          if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
              c.user?.firstName.toLowerCase().includes(term) ||
              c.user?.lastName.toLowerCase().includes(term) ||
              c.user?.email.toLowerCase().includes(term)
            );
          }
          
          if (this.filterStatus) {
            filtered = filtered.filter(c => c.status === this.filterStatus);
          }
          
          return filtered;
        })
      );
    }
  }

  updateStatus(cotisation: CotisationWithUser, status: 'paid' | 'pending' | 'overdue'): void {
    this.http.patch<CotisationWithUser>(`${environment.apiUrl}/cotisations/admin/${cotisation.id}/status`, {
      status
    }).subscribe({
      next: () => {
        this.notification.showSuccess('Statut mis à jour avec succès');
        this.loadCotisations();
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  editCotisation(cotisation: CotisationWithUser): void {
    // TODO: Open edit dialog
    this.notification.showInfo('Fonctionnalité à venir');
  }

  deleteCotisation(cotisation: CotisationWithUser): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette cotisation ?`)) {
      this.http.delete(`${environment.apiUrl}/cotisations/admin/${cotisation.id}`).subscribe({
        next: () => {
          this.notification.showSuccess('Cotisation supprimée avec succès');
          this.loadCotisations();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression');
        }
      });
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AddCotisationDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadCotisations();
      }
    });
  }
}

