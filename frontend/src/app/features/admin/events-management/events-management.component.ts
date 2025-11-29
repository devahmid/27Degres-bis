import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventsService, Event } from '../../../core/services/events.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AddEventDialogComponent } from './add-event-dialog.component';
import { ManageEventImagesDialogComponent } from './manage-event-images-dialog.component';
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
    MatMenuModule,
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './events-management.component.html',
  styleUrl: './events-management.component.scss'
})
export class EventsManagementComponent implements OnInit {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();
  filteredEvents$!: Observable<Event[]>;
  searchTerm = '';
  filterType = '';
  filterStatus = '';
  displayedColumns: string[] = ['title', 'type', 'startDate', 'location', 'status', 'actions'];

  constructor(
    private eventsService: EventsService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvents();
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
}
