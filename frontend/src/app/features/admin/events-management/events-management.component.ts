import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventsService, Event } from '../../../core/services/events.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AddEventDialogComponent } from './add-event-dialog.component';
import { ManageEventImagesDialogComponent } from './manage-event-images-dialog.component';
import { EventRegistrationsDialogComponent } from './event-registrations-dialog.component';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-events-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './events-management.component.html',
  styleUrl: './events-management.component.scss'
})
export class EventsManagementComponent implements OnInit, OnDestroy {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();
  filteredEvents$!: Observable<Event[]>;
  searchTerm = '';
  filterType = '';
  filterStatus = '';
  displayedColumns: string[] = ['title', 'type', 'startDate', 'location', 'status', 'actions'];
  openMenuId: number | null = null;
  private clickTimeout: any = null;
  private positionInterval: any = null;

  constructor(
    private eventsService: EventsService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    
    // Repositionner le menu lors du scroll
    window.addEventListener('scroll', () => {
      if (this.openMenuId !== null) {
        this.positionMenu(this.openMenuId);
      }
    }, true);
  }

  ngOnDestroy(): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
    }
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    this.closeMenus();
  }

  loadEvents(): void {
    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        this.eventsSubject.next(events);
      },
      error: (err) => {
        this.notification.showError('Erreur lors du chargement des événements.');
      }
    });

    this.filteredEvents$ = combineLatest([
      this.events$,
      this.eventsSubject.asObservable().pipe(
        map(() => this.searchTerm),
        startWith(this.searchTerm)
      ),
      this.eventsSubject.asObservable().pipe(
        map(() => this.filterType),
        startWith(this.filterType)
      ),
      this.eventsSubject.asObservable().pipe(
        map(() => this.filterStatus),
        startWith(this.filterStatus)
      )
    ]).pipe(
      map(([events, searchTerm, filterType, filterStatus]) => {
        let filtered = [...events];

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(term) ||
            e.description?.toLowerCase().includes(term) ||
            e.location?.toLowerCase().includes(term)
          );
        }

        if (filterType) {
          filtered = filtered.filter(e => e.type === filterType);
        }

        if (filterStatus) {
          filtered = filtered.filter(e => e.status === filterStatus);
        }

        return filtered;
      })
    );
  }

  onSearchChange(): void {
    this.eventsSubject.next(this.eventsSubject.getValue());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '90%',
      maxWidth: '900px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  editEvent(event: Event): void {
    this.closeMenus();
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '90%',
      maxWidth: '900px',
      disableClose: true,
      data: event
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  deleteEvent(event: Event): void {
    this.closeMenus();
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`)) {
      this.eventsService.deleteEvent(event.id).subscribe({
        next: () => {
          this.notification.showSuccess(`Événement "${event.title}" supprimé !`);
          this.loadEvents();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression de l\'événement.');
        }
      });
    }
  }

  manageImages(event: Event): void {
    this.closeMenus();
    const dialogRef = this.dialog.open(ManageEventImagesDialogComponent, {
      width: '90%',
      maxWidth: '1000px',
      disableClose: true,
      data: event
    });
  }

  getTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      'weekend': 'Weekend',
      'reunion': 'Réunion',
      'activite': 'Activité'
    };
    return labels[type || ''] || 'Autre';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'draft': 'Brouillon',
      'published': 'Publié',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  }

  toggleMenu(eventId: number, mouseEvent?: MouseEvent): void {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }
    this.openMenuId = this.openMenuId === eventId ? null : eventId;
    
    // Positionner le menu dynamiquement si ouvert
    if (this.openMenuId === eventId) {
      setTimeout(() => {
        this.positionMenu(eventId);
      }, 0);
      
      // Repositionner continuellement pendant que le menu est ouvert
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
      }
      this.positionInterval = setInterval(() => {
        if (this.openMenuId === eventId) {
          this.positionMenu(eventId);
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

  closeMenus(): void {
    if (this.openMenuId !== null) {
      const menu = document.querySelector(`[data-menu-event-id="${this.openMenuId}"]`) as HTMLElement;
      if (menu) {
        // Trouver le td parent original
        const button = document.querySelector(`[data-event-id="${this.openMenuId}"]`) as HTMLElement;
        if (button) {
          const originalTd = button.closest('td');
          if (originalTd && menu.parentElement === document.body) {
            originalTd.appendChild(menu);
          }
        }
      }
    }
    this.openMenuId = null;
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isMenuButton = target.closest('[data-event-id]');
    const isMenuDropdown = target.closest('.menu-dropdown');
    const isMenuItem = target.closest('.menu-item');

    if (!isMenuButton && !isMenuDropdown && !isMenuItem) {
      this.clickTimeout = setTimeout(() => {
        this.closeMenus();
      }, 0);
    } else if (isMenuButton || isMenuDropdown || isMenuItem) {
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }
    }
  }

  private positionMenu(eventId: number): void {
    const button = document.querySelector(`[data-event-id="${eventId}"]`) as HTMLElement;
    const menu = document.querySelector(`[data-menu-event-id="${eventId}"]`) as HTMLElement;
    
    if (!button || !menu) return;

    const buttonRect = button.getBoundingClientRect();
    const footer = document.querySelector('app-footer') as HTMLElement;
    const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
    const footerZIndex = footer ? parseInt(window.getComputedStyle(footer).zIndex || '0') : 0;

    // Déplacer le menu vers document.body pour éviter les problèmes de z-index
    const originalParent = menu.parentElement;
    const originalTd = originalParent && originalParent.tagName === 'TD' ? originalParent : null;
    if (originalParent && originalParent.tagName !== 'BODY') {
      document.body.appendChild(menu);
    }

    // Attendre que le menu soit dans le DOM pour calculer sa hauteur
    setTimeout(() => {
      const menuHeight = menu.offsetHeight || 200;
      
      // Calculer la position du menu
      let top = buttonRect.bottom + 4;
      
      // Vérifier si le menu dépasse le footer ou le bas de l'écran
      if (top + menuHeight > footerTop || top + menuHeight > window.innerHeight) {
        top = buttonRect.top - menuHeight - 4;
        if (top < 0) {
          top = 4;
        }
      }

      const left = buttonRect.right - (menu.offsetWidth || 200);
      const zIndex = Math.max(100000, footerZIndex + 100000);

      menu.style.cssText = `
        position: fixed !important;
        left: ${left}px !important;
        top: ${top}px !important;
        z-index: ${zIndex} !important;
        background: white !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        border: 1px solid #e5e7eb !important;
        padding: 0.5rem !important;
        min-width: 200px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 !important;
      `;
    }, 0);
  }

  viewRegistrations(event: Event): void {
    this.closeMenus();
    const dialogRef = this.dialog.open(EventRegistrationsDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      data: event
    });
  }
}
