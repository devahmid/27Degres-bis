import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventsService, Event } from '../../../core/services/events.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    DateFormatPipe,
    TruncatePipe
  ],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss'
})
export class EventListComponent implements OnInit {
  events$!: Observable<Event[]>;
  upcomingEvents$!: Observable<Event[]>;
  filteredEvents$!: Observable<Event[]>;
  filterType = '';
  currentDate = new Date();

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.events$ = this.eventsService.getEvents();
    this.upcomingEvents$ = this.eventsService.getUpcomingEvents(3);
    this.filteredEvents$ = this.events$;
  }

  onFilterChange(): void {
    this.filteredEvents$ = this.events$.pipe(
      map(events => {
        let filtered = events.filter(e => e.status === 'published');
        if (this.filterType) {
          filtered = filtered.filter(e => e.type === this.filterType);
        }
        return filtered;
      })
    );
  }

  getTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      'weekend': 'Weekend',
      'reunion': 'Réunion',
      'activite': 'Activité'
    };
    return labels[type || ''] || 'Autre';
  }

  getTypeColor(type?: string): string {
    const colors: Record<string, string> = {
      'weekend': 'primary',
      'reunion': 'secondary',
      'activite': 'accent'
    };
    return colors[type || ''] || 'gray';
  }

  isPastEvent(event: Event): boolean {
    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
    return endDate < this.currentDate;
  }
}

