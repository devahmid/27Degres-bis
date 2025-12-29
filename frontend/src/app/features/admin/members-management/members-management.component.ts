import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddMemberDialogComponent } from './add-member-dialog.component';
import { EditMemberDialogComponent } from './edit-member-dialog.component';
import { SendMessageDialogComponent } from './send-message-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-members-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    FormsModule,
    DateFormatPipe
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4">
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-4xl font-bold mb-2 text-dark">Gestion des Membres</h1>
          <p class="text-gray-600">Gérez tous les membres de l'association</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddDialog()" class="mt-4 md:mt-0">
          <mat-icon class="mr-2">person_add</mat-icon>
          Ajouter un membre
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-6">
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-dark font-medium mb-2">Rechercher</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="searchTerm" 
                  (ngModelChange)="onSearchChange()" 
                  placeholder="Nom, prénom, email..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
              </div>
            </div>
            <div>
              <label class="block text-dark font-medium mb-2">Rôle</label>
              <select 
                [(ngModel)]="filterRole" 
                (ngModelChange)="onSearchChange()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                <option value="">Tous</option>
                <option value="admin">Admin</option>
                <option value="bureau">Bureau</option>
                <option value="membre">Membre</option>
                <option value="visiteur">Visiteur</option>
              </select>
            </div>
            <div>
              <label class="block text-dark font-medium mb-2">Statut</label>
              <select 
                [(ngModel)]="filterStatus" 
                (ngModelChange)="onSearchChange()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                <option value="">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Members Table -->
      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="filteredMembers$" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let member">
                <div class="flex items-center">
                  <mat-icon class="mr-2 text-gray-400">person</mat-icon>
                  <span>{{ member.firstName }} {{ member.lastName }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let member">{{ member.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Rôle</th>
              <td mat-cell *matCellDef="let member">
                <span [ngClass]="{
                  'bg-red-100 text-red-800': member.role === 'admin',
                  'bg-blue-100 text-blue-800': member.role === 'bureau',
                  'bg-green-100 text-green-800': member.role === 'membre',
                  'bg-gray-100 text-gray-800': member.role === 'visiteur'
                }" class="px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {{ member.role }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let member">
                <span [ngClass]="{
                  'bg-green-100 text-green-800': member.isActive,
                  'bg-gray-100 text-gray-800': !member.isActive
                }" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ member.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="joinDate">
              <th mat-header-cell *matHeaderCellDef>Date d'adhésion</th>
              <td mat-cell *matCellDef="let member">{{ member.joinDate | dateFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let member; let i = index">
                <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{member: member}" [disableRipple]="false" type="button">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Menu défini une seule fois en dehors du tableau -->
          <mat-menu #menu="matMenu" [hasBackdrop]="false">
            <ng-template matMenuContent let-member="member">
              <button mat-menu-item (click)="editMember(member)">
                <mat-icon>edit</mat-icon>
                <span>Modifier</span>
              </button>
              <button mat-menu-item (click)="sendMessage(member)">
                <mat-icon>email</mat-icon>
                <span>Envoyer un message</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item [matMenuTriggerFor]="roleMenu" [matMenuTriggerData]="{member: member}">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Changer le rôle</span>
                <mat-icon class="ml-auto">arrow_right</mat-icon>
              </button>
              <button mat-menu-item (click)="toggleMemberStatus(member)">
                <mat-icon>{{ member.isActive ? 'block' : 'check_circle' }}</mat-icon>
                <span>{{ member.isActive ? 'Bloquer' : 'Débloquer' }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="viewMemberCotisations(member)">
                <mat-icon>credit_card</mat-icon>
                <span>Voir cotisations</span>
              </button>
              <button mat-menu-item (click)="deleteMember(member)" class="text-red-600">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </ng-template>
          </mat-menu>

          <!-- Sous-menu pour les rôles -->
          <mat-menu #roleMenu="matMenu">
            <ng-template matMenuContent let-member="member">
              <button mat-menu-item (click)="changeRole(member, 'admin')">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin</span>
              </button>
              <button mat-menu-item (click)="changeRole(member, 'bureau')">
                <mat-icon>group</mat-icon>
                <span>Bureau</span>
              </button>
              <button mat-menu-item (click)="changeRole(member, 'membre')">
                <mat-icon>person</mat-icon>
                <span>Membre</span>
              </button>
              <button mat-menu-item (click)="changeRole(member, 'visiteur')">
                <mat-icon>visibility</mat-icon>
                <span>Visiteur</span>
              </button>
            </ng-template>
          </mat-menu>
          
          <div *ngIf="(filteredMembers$ | async)?.length === 0" class="text-center py-8 text-gray-500">
            Aucun membre trouvé
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './members-management.component.scss'
})
export class MembersManagementComponent implements OnInit {
  members$!: Observable<User[]>;
  filteredMembers$!: Observable<User[]>;
  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'joinDate', 'actions'];

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.members$ = this.http.get<User[]>(`${environment.apiUrl}/users/admin/all`);
    this.filteredMembers$ = this.members$;
  }

  onSearchChange(): void {
    this.filteredMembers$ = this.members$.pipe(
      map(members => {
        let filtered = [...members];
        
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(m => 
            m.firstName.toLowerCase().includes(term) ||
            m.lastName.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term)
          );
        }
        
        if (this.filterRole) {
          filtered = filtered.filter(m => m.role === this.filterRole);
        }
        
        if (this.filterStatus) {
          filtered = filtered.filter(m => 
            this.filterStatus === 'active' ? m.isActive : !m.isActive
          );
        }
        
        return filtered;
      })
    );
  }

  editMember(member: User): void {
    const dialogRef = this.dialog.open(EditMemberDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      disableClose: true,
      data: { member }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.ngOnInit();
      }
    });
  }

  viewMemberCotisations(member: User): void {
    // TODO: Navigate to cotisations with filter
    this.notification.showInfo('Fonctionnalité à venir');
  }

  changeRole(member: User, newRole: string): void {
    if (confirm(`Changer le rôle de ${member.firstName} ${member.lastName} en "${newRole}" ?`)) {
      this.http.patch<User>(`${environment.apiUrl}/users/admin/${member.id}`, {
        role: newRole
      }).subscribe({
        next: () => {
          this.notification.showSuccess(`Rôle changé en "${newRole}" avec succès`);
          this.ngOnInit();
        },
        error: () => {
          this.notification.showError('Erreur lors du changement de rôle');
        }
      });
    }
  }

  sendMessage(member: User): void {
    const dialogRef = this.dialog.open(SendMessageDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      disableClose: true,
      data: { member }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      // Le message est envoyé depuis le dialog
    });
  }

  toggleMemberStatus(member: User): void {
    this.http.patch<User>(`${environment.apiUrl}/users/admin/${member.id}`, {
      isActive: !member.isActive
    }).subscribe({
      next: () => {
        this.notification.showSuccess(`Membre ${member.isActive ? 'désactivé' : 'activé'} avec succès`);
        this.ngOnInit();
      },
      error: () => {
        this.notification.showError('Erreur lors de la modification');
      }
    });
  }

  deleteMember(member: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName} ?`)) {
      this.http.delete(`${environment.apiUrl}/users/admin/${member.id}`).subscribe({
        next: () => {
          this.notification.showSuccess('Membre supprimé avec succès');
          this.ngOnInit();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression');
        }
      });
    }
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.ngOnInit();
      }
    });
  }
}
