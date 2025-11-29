import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Cotisation } from '../../../core/models/cotisation.model';
import { Event } from '../../../core/models/event.model';
import { Post } from '../../../core/models/post.model';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BadgeStatusComponent,
    DateFormatPipe,
    TruncatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser$;
  cotisationStatus$!: Observable<Cotisation | null>;
  upcomingEvents$!: Observable<Event[]>;
  recentNews$!: Observable<Post[]>;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.cotisationStatus$ = this.http.get<Cotisation | null>(`${environment.apiUrl}/cotisations/current`);
    this.upcomingEvents$ = this.http.get<Event[]>(`${environment.apiUrl}/events/upcoming?limit=3`);
    this.recentNews$ = this.http.get<Post[]>(`${environment.apiUrl}/posts/recent?limit=3`);
  }
}

