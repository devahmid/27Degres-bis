import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GalleryService, GalleryImage } from '../../core/services/gallery.service';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { environment } from '../../../environments/environment';

interface EventImage {
  id: number;
  eventId: number;
  event?: {
    title: string;
  };
  imageUrl: string;
  caption?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-public-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DateFormatPipe
  ],
  templateUrl: './public-gallery.component.html',
  styleUrl: './public-gallery.component.scss'
})
export class PublicGalleryComponent implements OnInit {
  galleryImages$!: Observable<GalleryImage[]>;
  eventImages$!: Observable<EventImage[]>;
  allImages$!: Observable<Array<{ type: 'gallery' | 'event'; image: GalleryImage | EventImage }>>;

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    // Charger uniquement les images publiques de la galerie
    this.galleryImages$ = this.http.get<GalleryImage[]>(`${environment.apiUrl}/gallery`).pipe(
      map(images => images.filter(img => img.isPublic))
    );
    
    // Charger les images d'événements (toujours publiques)
    this.eventImages$ = this.http.get<EventImage[]>(`${environment.apiUrl}/events/images`);

    // Combiner toutes les images
    this.allImages$ = combineLatest([
      this.galleryImages$,
      this.eventImages$
    ]).pipe(
      map(([galleryImages, eventImages]) => {
        const gallery = galleryImages.map(img => ({ type: 'gallery' as const, image: img }));
        const events = eventImages.map((img: any) => ({ type: 'event' as const, image: img }));
        return [...gallery, ...events].sort((a, b) => {
          const dateA = new Date(a.image.createdAt).getTime();
          const dateB = new Date(b.image.createdAt).getTime();
          return dateB - dateA; // Plus récent en premier
        });
      })
    );
  }

  selectedImageUrl: string | null = null;
  selectedImageCaption: string | null = null;

  openImageModal(imageUrl: string, caption?: string): void {
    this.selectedImageUrl = imageUrl;
    this.selectedImageCaption = caption || null;
  }

  closeImageModal(): void {
    this.selectedImageUrl = null;
    this.selectedImageCaption = null;
  }

  // Helper methods pour éviter les type assertions dans le template
  isEventImage(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): item is { type: 'event'; image: EventImage } {
    return item.type === 'event';
  }

  getEventTitle(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): string | null {
    if (this.isEventImage(item) && item.image.event) {
      return item.image.event.title;
    }
    return null;
  }
}

