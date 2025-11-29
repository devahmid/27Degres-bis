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
  upcomingEvent$!: Observable<Event | null>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.recentPosts$ = this.http.get<Post[]>(`${environment.apiUrl}/posts/recent`);
    this.upcomingEvent$ = this.http.get<Event | null>(`${environment.apiUrl}/events/upcoming`);
  }
}

