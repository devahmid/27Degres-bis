import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Event } from '../../../core/models/event.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { FormatContentPipe } from '../../../shared/pipes/format-content.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EventsService, EventCarpoolEntry } from '../../../core/services/events.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventRegistrationDialogComponent } from '../event-registration-dialog/event-registration-dialog.component';

interface PublicEventRegistration {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  availabilityType?: 'full' | 'partial';
  availabilityDetails?: string;
  isVolunteer?: boolean;
  volunteerActivities?: string[];
  registeredAt: Date;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    DateFormatPipe,
    FormatContentPipe,
  ],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {
  event$!: Observable<Event>;
  isRegistered = false;
  checkingRegistration = false;
  registrations: PublicEventRegistration[] = [];
  loadingRegistrations = false;
  expandedRegistrationId: number | null = null;
  carpoolEntries: EventCarpoolEntry[] = [];
  carpoolLoading = false;
  cpKind: 'offer' | 'seek' = 'offer';
  cpDeparture = '';
  cpSeats = 1;
  cpComment = '';
  carpoolSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService,
    private notification: NotificationService,
    private eventsService: EventsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      const id = +eventId;
      this.event$ = this.http.get<Event>(`${environment.apiUrl}/events/${id}`);
      if (this.authService.isLoggedIn()) {
        this.checkRegistrationStatus(id);
        this.loadRegistrations(id);
      }
    }
  }

  loadRegistrations(eventId: number): void {
    this.loadingRegistrations = true;
    this.eventsService.getPublicEventRegistrations(eventId).subscribe({
      next: (registrations) => {
        this.registrations = registrations;
        this.loadingRegistrations = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des inscriptions:', error);
        this.loadingRegistrations = false;
      }
    });
  }

  toggleRegistrationDetails(registrationId: number): void {
    this.expandedRegistrationId = this.expandedRegistrationId === registrationId ? null : registrationId;
  }

  getAvailabilityLabel(reg: PublicEventRegistration): string {
    if (reg.availabilityType === 'partial') {
      return 'Partielle';
    }
    return 'Complète';
  }

  getVolunteerActivitiesLabel(activities: string[]): string {
    if (!activities || activities.length === 0) return '-';
    
    const labels: Record<string, string> = {
      'courses': 'Courses',
      'keys': 'Clés',
      'cooking': 'Cuisine',
      'setup': 'Installation',
      'cleaning': 'Nettoyage',
      'other': 'Autre'
    };
    
    return activities
      .filter(a => a !== 'other' || !a.startsWith('other:'))
      .map(a => {
        if (a.startsWith('other:')) {
          return `Autre: ${a.replace('other:', '')}`;
        }
        return labels[a] || a;
      })
      .join(', ');
  }

  checkRegistrationStatus(eventId: number): void {
    this.checkingRegistration = true;
    this.eventsService.isRegisteredToEvent(eventId).subscribe({
      next: (response) => {
        this.isRegistered = response.registered;
        this.checkingRegistration = false;
        if (response.registered) {
          this.loadCarpool(eventId);
        } else {
          this.carpoolEntries = [];
        }
      },
      error: () => {
        this.isRegistered = false;
        this.checkingRegistration = false;
        this.carpoolEntries = [];
      }
    });
  }

  loadCarpool(eventId: number): void {
    if (!this.authService.isLoggedIn()) return;
    this.carpoolLoading = true;
    this.eventsService.getEventCarpool(eventId).subscribe({
      next: (rows) => {
        this.carpoolEntries = rows;
        this.carpoolLoading = false;
      },
      error: () => {
        this.carpoolEntries = [];
        this.carpoolLoading = false;
      },
    });
  }

  submitCarpool(eventId: number): void {
    const departure = this.cpDeparture.trim();
    if (departure.length < 2) {
      this.notification.showError('Indiquez une zone ou ville de départ');
      return;
    }
    if (this.cpKind === 'offer' && (!this.cpSeats || this.cpSeats < 1)) {
      this.notification.showError('Indiquez le nombre de places proposées');
      return;
    }
    this.carpoolSubmitting = true;
    this.eventsService
      .createEventCarpool(eventId, {
        kind: this.cpKind,
        departureArea: departure,
        seatsOffered: this.cpKind === 'offer' ? this.cpSeats : undefined,
        comment: this.cpComment.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.carpoolSubmitting = false;
          this.notification.showSuccess('Annonce enregistrée');
          this.cpDeparture = '';
          this.cpComment = '';
          this.cpSeats = 1;
          this.loadCarpool(eventId);
        },
        error: (err) => {
          this.carpoolSubmitting = false;
          this.notification.showError(err.error?.message || 'Erreur');
        },
      });
  }

  deleteCarpoolEntry(carpoolId: number, eventId: number): void {
    if (!confirm('Supprimer cette annonce ?')) return;
    this.eventsService.deleteEventCarpool(carpoolId).subscribe({
      next: () => {
        this.notification.showSuccess('Annonce supprimée');
        this.loadCarpool(eventId);
      },
      error: () => this.notification.showError('Suppression impossible'),
    });
  }

  isOwnCarpoolEntry(entry: EventCarpoolEntry): boolean {
    const u = this.authService.getCurrentUser();
    return !!u && u.id === entry.user.id;
  }

  registerForEvent(event: Event): void {
    if (!this.authService.isLoggedIn()) {
      this.notification.showError('Vous devez être connecté pour vous inscrire');
      return;
    }

    if (this.isRegistered) {
      this.notification.showInfo('Vous êtes déjà inscrit à cet événement');
      return;
    }

    // Ouvrir le dialog d'inscription détaillée
    const dialogRef = this.dialog.open(EventRegistrationDialogComponent, {
      width: '90%',
      maxWidth: '700px',
      disableClose: true,
      data: event
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.checkRegistrationStatus(event.id);
        this.loadRegistrations(event.id);
        this.loadCarpool(event.id);
      }
    });
  }

  unregisterFromEvent(eventId: number): void {
    if (!this.authService.isLoggedIn() || !this.isRegistered) {
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir vous désinscrire de cet événement ?')) {
      this.eventsService.unregisterFromEvent(eventId).subscribe({
        next: () => {
          this.notification.showSuccess('Désinscription réussie');
          this.isRegistered = false;
          this.carpoolEntries = [];
          this.loadRegistrations(eventId);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Erreur lors de la désinscription';
          this.notification.showError(errorMessage);
        }
      });
    }
  }
}









