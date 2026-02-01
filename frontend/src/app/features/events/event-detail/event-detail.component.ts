import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Event } from '../../../core/models/event.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { FormatContentPipe } from '../../../shared/pipes/format-content.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EventsService } from '../../../core/services/events.service';
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
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, DateFormatPipe, FormatContentPipe],
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
      
      // Vérifier si l'utilisateur est déjà inscrit et charger les inscriptions
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
      },
      error: () => {
        // Si l'utilisateur n'est pas connecté ou erreur, on considère qu'il n'est pas inscrit
        this.isRegistered = false;
        this.checkingRegistration = false;
      }
    });
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
        // Recharger le statut d'inscription et les inscriptions
        this.checkRegistrationStatus(event.id);
        this.loadRegistrations(event.id);
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
          // Recharger les inscriptions
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









