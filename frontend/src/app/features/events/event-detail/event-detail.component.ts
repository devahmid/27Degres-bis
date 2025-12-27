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
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, DateFormatPipe],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {
  event$!: Observable<Event>;
  isRegistered = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.event$ = this.http.get<Event>(`${environment.apiUrl}/events/${eventId}`);
    }
  }

  registerForEvent(eventId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.notification.showError('Vous devez être connecté pour vous inscrire');
      return;
    }

    this.http.post(`${environment.apiUrl}/events/${eventId}/register`, {})
      .subscribe({
        next: () => {
          this.notification.showSuccess('Inscription réussie !');
          this.isRegistered = true;
        },
        error: () => {
          this.notification.showError('Erreur lors de l\'inscription');
        }
      });
  }
}









