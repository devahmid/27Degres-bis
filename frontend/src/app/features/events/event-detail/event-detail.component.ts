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

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, DateFormatPipe, FormatContentPipe],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {
  event$!: Observable<Event>;
  isRegistered = false;
  checkingRegistration = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService,
    private notification: NotificationService,
    private eventsService: EventsService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      const id = +eventId;
      this.event$ = this.http.get<Event>(`${environment.apiUrl}/events/${id}`);
      
      // Vérifier si l'utilisateur est déjà inscrit
      if (this.authService.isLoggedIn()) {
        this.checkRegistrationStatus(id);
      }
    }
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

  registerForEvent(eventId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.notification.showError('Vous devez être connecté pour vous inscrire');
      return;
    }

    if (this.isRegistered) {
      this.notification.showInfo('Vous êtes déjà inscrit à cet événement');
      return;
    }

    this.eventsService.registerToEvent(eventId).subscribe({
      next: () => {
        this.notification.showSuccess('Inscription réussie !');
        this.isRegistered = true;
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
        this.notification.showError(errorMessage);
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
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Erreur lors de la désinscription';
          this.notification.showError(errorMessage);
        }
      });
    }
  }
}









