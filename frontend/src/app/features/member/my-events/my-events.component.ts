import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventsService } from '../../../core/services/events.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { EventRegistrationDialogComponent } from '../../events/event-registration-dialog/event-registration-dialog.component';

interface MyRegistration {
  id: number;
  eventId: number;
  event: {
    id: number;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    status: string;
    featuredImage?: string;
  };
  availabilityType?: 'full' | 'partial';
  availabilityDetails?: string;
  isVolunteer: boolean;
  volunteerActivities: string[];
  notes?: string;
  registeredAt: Date;
}

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    DateFormatPipe
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss'
})
export class MyEventsComponent implements OnInit {
  registrations: MyRegistration[] = [];
  loading = true;
  upcomingRegistrations: MyRegistration[] = [];
  pastRegistrations: MyRegistration[] = [];

  constructor(
    private eventsService: EventsService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    this.eventsService.getMyRegistrations().subscribe({
      next: (registrations) => {
        this.registrations = registrations;
        this.updateFilteredRegistrations();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des inscriptions:', error);
        this.notification.showError('Erreur lors du chargement de vos inscriptions');
        this.loading = false;
      }
    });
  }

  updateFilteredRegistrations(): void {
    const now = new Date();
    this.upcomingRegistrations = this.registrations.filter(r => {
      const eventDate = new Date(r.event.startDate);
      return eventDate >= now;
    });
    this.pastRegistrations = this.registrations.filter(r => {
      const eventDate = new Date(r.event.startDate);
      return eventDate < now;
    });
  }

  editRegistration(registration: MyRegistration): void {
    // Charger les détails complets de l'événement
    this.eventsService.getEvent(registration.eventId).subscribe({
      next: (event) => {
        const dialogRef = this.dialog.open(EventRegistrationDialogComponent, {
          width: '90%',
          maxWidth: '800px',
          data: event,
          disableClose: true
        });

        // Pré-remplir le formulaire avec les données actuelles après l'ouverture
        setTimeout(() => {
          const component = dialogRef.componentInstance;
          if (component) {
            component.isEditMode = true;
            component.registrationId = registration.id;
            
            if (component.registrationForm) {
              component.registrationForm.patchValue({
                availabilityType: registration.availabilityType || 'full',
                availabilityDetails: registration.availabilityDetails || '',
                isVolunteer: registration.isVolunteer || false,
                volunteerCourses: registration.volunteerActivities?.includes('courses') || false,
                volunteerKeys: registration.volunteerActivities?.includes('keys') || false,
                volunteerCooking: registration.volunteerActivities?.includes('cooking') || false,
                volunteerSetup: registration.volunteerActivities?.includes('setup') || false,
                volunteerCleaning: registration.volunteerActivities?.includes('cleaning') || false,
                volunteerOther: registration.volunteerActivities?.some(a => a.startsWith('other')) || false,
                volunteerOtherDetails: registration.volunteerActivities?.find(a => a.startsWith('other:'))?.replace('other:', '') || '',
                notes: registration.notes || ''
              });
            }
          }
        }, 100);

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loadRegistrations();
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'événement:', error);
        this.notification.showError('Erreur lors du chargement de l\'événement');
      }
    });
  }

  unregister(eventId: number, eventTitle: string): void {
    if (!confirm(`Êtes-vous sûr de vouloir vous désinscrire de l'événement "${eventTitle}" ?`)) {
      return;
    }

    this.eventsService.unregisterFromEvent(eventId).subscribe({
      next: () => {
        this.notification.showSuccess('Désinscription réussie');
        this.loadRegistrations();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Erreur lors de la désinscription';
        this.notification.showError(errorMessage);
      }
    });
  }

  getAvailabilityLabel(registration: MyRegistration): string {
    if (registration.availabilityType === 'partial' && registration.availabilityDetails) {
      return `Partielle : ${registration.availabilityDetails}`;
    }
    return 'Tout le weekend';
  }

  getVolunteerActivitiesLabel(registration: MyRegistration): string {
    if (!registration.isVolunteer || !registration.volunteerActivities || registration.volunteerActivities.length === 0) {
      return 'Aucune';
    }

    const activitiesLabels: Record<string, string> = {
      'courses': 'Courses / Achats',
      'keys': 'Récupération des clés',
      'cooking': 'Cuisine',
      'setup': 'Installation / Mise en place',
      'cleaning': 'Nettoyage',
      'other': 'Autre'
    };

    const activities = registration.volunteerActivities
      .filter(a => !a.startsWith('other:'))
      .map(a => activitiesLabels[a] || a);

    const otherActivity = registration.volunteerActivities.find(a => a.startsWith('other:'));
    if (otherActivity) {
      activities.push(`Autre : ${otherActivity.replace('other:', '')}`);
    }

    return activities.join(', ');
  }

}
