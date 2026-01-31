import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
    MatDividerModule,
    FormsModule,
    DateFormatPipe
  ],
  templateUrl: './members-management.component.html',
  styleUrl: './members-management.component.scss'
})
export class MembersManagementComponent implements OnInit, OnDestroy {
  members$!: Observable<User[]>;
  filteredMembers$!: Observable<User[]>;
  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'joinDate', 'actions'];
  openMenuId: number | null = null;
  openRoleMenuId: number | null = null;
  private clickTimeout: any = null;
  private positionInterval: any = null;
  
  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.members$ = this.http.get<User[]>(`${environment.apiUrl}/users/admin/all`);
    this.filteredMembers$ = this.members$;
    
    // Repositionner le menu lors du scroll
    window.addEventListener('scroll', () => {
      if (this.openMenuId !== null) {
        this.positionMenu(this.openMenuId);
      }
    }, true);
  }
  
  toggleMenu(memberId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openMenuId = this.openMenuId === memberId ? null : memberId;
    this.openRoleMenuId = null;
    
    // Positionner le menu dynamiquement si ouvert
    if (this.openMenuId === memberId) {
      setTimeout(() => {
        this.positionMenu(memberId);
      }, 0);
      
      // Repositionner continuellement pendant que le menu est ouvert
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
      }
      this.positionInterval = setInterval(() => {
        if (this.openMenuId === memberId) {
          this.positionMenu(memberId);
        } else {
          clearInterval(this.positionInterval);
        }
      }, 100);
    } else {
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
        this.positionInterval = null;
      }
    }
  }
  
  private positionMenu(memberId: number): void {
    const button = document.querySelector(`button[data-member-id="${memberId}"]`) as HTMLElement;
    const menu = document.querySelector(`.menu-dropdown[data-member-id="${memberId}"]`) as HTMLElement;
    
    if (button && menu) {
      const buttonRect = button.getBoundingClientRect();
      const menuHeight = menu.offsetHeight || 300;
      const viewportHeight = window.innerHeight;
      
      // Trouver le footer pour connaître sa position
      const footer = document.querySelector('footer') as HTMLElement;
      const footerTop = footer ? footer.getBoundingClientRect().top : viewportHeight;
      const footerZIndex = footer ? parseInt(window.getComputedStyle(footer).zIndex) || 1 : 1;
      
      // Positionner le menu à droite du bouton
      let top = buttonRect.bottom + 4;
      
      // Si le menu dépasse en bas (en tenant compte du footer), l'afficher au-dessus du bouton
      if (top + menuHeight > footerTop - 10) {
        top = buttonRect.top - menuHeight - 4;
        // Si même au-dessus ça dépasse, le mettre juste au-dessus du footer
        if (top < 0) {
          top = Math.max(10, footerTop - menuHeight - 10);
        }
      }
      
      // Calculer la position left pour aligner à droite du bouton
      const menuWidth = menu.offsetWidth || 200;
      const left = Math.max(10, buttonRect.right - menuWidth);
      
      // Utiliser un z-index beaucoup plus élevé que le footer
      const menuZIndex = Math.max(100000, footerZIndex + 100000);
      
      // Déplacer le menu dans le body pour éviter les problèmes de contexte d'empilement
      if (menu.parentElement !== document.body) {
        document.body.appendChild(menu);
      }
      
      menu.style.cssText = `
        position: fixed !important;
        left: ${left}px !important;
        top: ${top}px !important;
        z-index: ${menuZIndex} !important;
        background: white !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
        border: 1px solid #e5e7eb !important;
        padding: 8px 0 !important;
        min-width: 200px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 !important;
      `;
    }
  }
  
  ngOnDestroy(): void {
    // Nettoyer les intervals
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
    }
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    // Nettoyer les menus du body si le composant est détruit
    const menus = document.querySelectorAll('.menu-dropdown');
    menus.forEach(menu => {
      if (menu.parentElement === document.body) {
        menu.remove();
      }
    });
  }
  
  toggleRoleMenu(memberId: number, event: Event): void {
    event.stopPropagation();
    this.openRoleMenuId = this.openRoleMenuId === memberId ? null : memberId;
  }
  
  closeMenus(): void {
    // Remettre les menus dans leur conteneur d'origine avant de fermer
    const menus = document.querySelectorAll('.menu-dropdown');
    menus.forEach(menu => {
      if (menu.parentElement === document.body) {
        // Trouver le td parent original
        const memberId = menu.getAttribute('data-member-id');
        if (memberId) {
          const button = document.querySelector(`button[data-member-id="${memberId}"]`);
          if (button) {
            const td = button.closest('td');
            if (td) {
              td.appendChild(menu);
            }
          }
        }
      }
    });
    
    this.openMenuId = null;
    this.openRoleMenuId = null;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Annuler le timeout précédent
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    // Attendre un peu avant de vérifier (pour laisser le temps au toggleMenu de s'exécuter)
    this.clickTimeout = setTimeout(() => {
      const target = event.target as HTMLElement;
      // Ne pas fermer si on clique sur le bouton ou dans le menu
      const clickedMenu = target.closest('.menu-dropdown');
      const clickedButton = target.closest('button[mat-icon-button]');
      const clickedMenuItem = target.closest('.menu-item');
      
      if (!clickedMenu && !clickedButton && !clickedMenuItem) {
        this.closeMenus();
      }
    }, 10);
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
