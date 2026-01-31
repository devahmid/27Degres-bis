import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post } from '../../core/models/post.model';
import { Event } from '../../core/models/event.model';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DateFormatPipe,
    TruncatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  recentPosts$!: Observable<Post[]>;
  upcomingEvents$!: Observable<Event[]>;
  heroImageUrl = '/assets/images/hero-image.webp'; // Chemin de l'image hero
  hasHeroImage = true; // Par défaut, on essaie d'afficher l'image

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.recentPosts$ = this.http.get<Post[]>(`${environment.apiUrl}/posts/recent`);
    this.upcomingEvents$ = this.http.get<Event[]>(`${environment.apiUrl}/events/upcoming?limit=3`);
  }

  onImageError(): void {
    // Si l'image ne peut pas être chargée, utiliser le fallback
    this.hasHeroImage = false;
  }
}

