import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EventsService, Event } from '../../../core/services/events.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

interface EventRegistration {
  id: number;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  availabilityType?: 'full' | 'partial';
  availabilityDetails?: string;
  isVolunteer?: boolean;
  volunteerActivities?: string[];
  notes?: string;
  registeredAt: Date;
}

@Component({
  selector: 'app-event-registrations-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    DateFormatPipe
  ],
  template: `
    <div class="p-6 max-w-4xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-dark">Inscriptions - {{ data.title }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <mat-icon class="text-4xl text-gray-400 animate-spin">refresh</mat-icon>
        <p class="mt-4 text-gray-600">Chargement des inscriptions...</p>
      </div>

      <div *ngIf="!loading && registrations.length === 0" class="text-center py-12">
        <mat-icon class="text-4xl text-gray-400">people_outline</mat-icon>
        <p class="mt-4 text-gray-600">Aucune inscription pour cet événement</p>
      </div>

      <div *ngIf="!loading && registrations.length > 0" class="space-y-4">
        <div *ngFor="let reg of registrations" class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors" (click)="toggleDetails(reg.id)">
            <div class="flex-grow">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex-1 min-w-[200px]">
                  <p class="font-semibold text-dark">{{ reg.user.firstName }} {{ reg.user.lastName }}</p>
                  <p class="text-sm text-gray-600">{{ reg.user.email }}</p>
                </div>
                <div class="text-sm">
                  <span class="px-2 py-1 rounded text-xs font-medium" [ngClass]="reg.availabilityType === 'full' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ getAvailabilityLabel(reg) }}
                  </span>
                </div>
                <div class="text-sm" *ngIf="reg.isVolunteer">
                  <span class="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium flex items-center gap-1">
                    <mat-icon class="text-sm">volunteer_activism</mat-icon>
                    Volontaire
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  {{ reg.registeredAt | dateFormat }}
                </div>
                <mat-icon [class.rotate-180]="expandedRowId === reg.id" class="transition-transform">expand_more</mat-icon>
              </div>
            </div>
          </div>
          
          <!-- Détails expandables -->
          <div *ngIf="expandedRowId === reg.id" class="p-4 bg-white border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngIf="reg.availabilityType === 'partial' && reg.availabilityDetails">
                <h4 class="font-semibold text-dark mb-2 flex items-center gap-2">
                  <mat-icon class="text-lg">schedule</mat-icon>
                  Disponibilités
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap">{{ reg.availabilityDetails }}</p>
              </div>
              
              <div *ngIf="reg.isVolunteer && reg.volunteerActivities && reg.volunteerActivities.length > 0">
                <h4 class="font-semibold text-dark mb-2 flex items-center gap-2">
                  <mat-icon class="text-lg">volunteer_activism</mat-icon>
                  Activités de volontariat
                </h4>
                <p class="text-gray-700">{{ getVolunteerActivitiesLabel(reg.volunteerActivities) }}</p>
              </div>
              
              <div *ngIf="reg.notes" class="md:col-span-2">
                <h4 class="font-semibold text-dark mb-2 flex items-center gap-2">
                  <mat-icon class="text-lg">note</mat-icon>
                  Notes
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap">{{ reg.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">
            <strong>Total :</strong> {{ registrations.length }} inscription{{ registrations.length > 1 ? 's' : '' }}
            <span *ngIf="data.maxParticipants">
              / {{ data.maxParticipants }} maximum
            </span>
          </p>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button mat-button (click)="onClose()">Fermer</button>
      </div>
    </div>
  `,
  styles: []
})
export class EventRegistrationsDialogComponent implements OnInit {
  registrations: EventRegistration[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'email', 'availability', 'volunteer', 'registeredAt'];
  expandedRowId: number | null = null;

  constructor(
    private eventsService: EventsService,
    private dialogRef: MatDialogRef<EventRegistrationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    this.eventsService.getEventRegistrations(this.data.id).subscribe({
      next: (registrations) => {
        this.registrations = registrations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des inscriptions:', error);
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  toggleDetails(registrationId: number): void {
    this.expandedRowId = this.expandedRowId === registrationId ? null : registrationId;
  }

  getAvailabilityLabel(reg: EventRegistration): string {
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
}
