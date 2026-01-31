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

      <div *ngIf="!loading && registrations.length > 0" class="overflow-x-auto">
        <table mat-table [dataSource]="registrations" class="w-full">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let reg">
              {{ reg.user.firstName }} {{ reg.user.lastName }}
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let reg">{{ reg.user.email }}</td>
          </ng-container>

          <!-- Registered At Column -->
          <ng-container matColumnDef="registeredAt">
            <th mat-header-cell *matHeaderCellDef>Date d'inscription</th>
            <td mat-cell *matCellDef="let reg">{{ reg.registeredAt | dateFormat }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

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
  displayedColumns: string[] = ['name', 'email', 'registeredAt'];

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
}
