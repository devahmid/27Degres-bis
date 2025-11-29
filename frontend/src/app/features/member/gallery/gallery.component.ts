import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, shareReplay, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GalleryService, GalleryImage } from '../../../core/services/gallery.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';
import { AddGalleryImageDialogComponent } from '../../admin/gallery-management/add-gallery-image-dialog.component';

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
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatMenuModule,
    DateFormatPipe
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  galleryImages$!: Observable<GalleryImage[]>;
  eventImages$!: Observable<EventImage[]>;
  allImages$!: Observable<Array<{ type: 'gallery' | 'event'; image: GalleryImage | EventImage }>>;
  
  private filterTypeSubject = new BehaviorSubject<'all' | 'public' | 'private'>('all');
  filterType: 'all' | 'public' | 'private' = 'all';
  filteredImages$!: Observable<Array<{ type: 'gallery' | 'event'; image: GalleryImage | EventImage }>>;
  isAuthenticated = false;

  constructor(
    private galleryService: GalleryService,
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Charger les images une seule fois au démarrage
    this.loadImages();
    
    // Mettre à jour le statut d'authentification sans recharger les images
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  loadImages(): void {
    // Charger les images de la galerie (le service gère déjà la visibilité)
    this.galleryImages$ = this.galleryService.getImages().pipe(
      shareReplay(1) // Éviter les requêtes multiples
    );
    
    // Charger les images d'événements
    this.eventImages$ = this.http.get<EventImage[]>(`${environment.apiUrl}/events/images`).pipe(
      shareReplay(1) // Éviter les requêtes multiples
    );

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
      }),
      shareReplay(1) // Éviter les recalculs multiples
    );

    // Créer l'Observable filtré qui réagit aux changements de filterType
    this.filteredImages$ = combineLatest([
      this.allImages$,
      this.filterTypeSubject.asObservable()
    ]).pipe(
      map(([images, filterType]) => {
        if (filterType === 'all') {
          return images;
        } else if (filterType === 'public') {
          return images.filter(item => {
            if (item.type === 'gallery') {
              return (item.image as GalleryImage).isPublic;
            }
            return true; // Les images d'événements sont toujours publiques
          });
        } else {
          // private
          return images.filter(item => {
            if (item.type === 'gallery') {
              return !(item.image as GalleryImage).isPublic;
            }
            return false; // Pas d'images privées pour les événements
          });
        }
      }),
      shareReplay(1)
    );
  }

  getFilteredImages(): Observable<Array<{ type: 'gallery' | 'event'; image: GalleryImage | EventImage }>> {
    return this.filteredImages$;
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

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddGalleryImageDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadImages();
      }
    });
  }

  // Helper methods pour éviter les type assertions dans le template
  isGalleryImage(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): item is { type: 'gallery'; image: GalleryImage } {
    return item.type === 'gallery';
  }

  isEventImage(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): item is { type: 'event'; image: EventImage } {
    return item.type === 'event';
  }

  getImagePublicStatus(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): boolean {
    if (this.isGalleryImage(item)) {
      return item.image.isPublic;
    }
    return true; // Les images d'événements sont toujours publiques
  }

  getBadgeClass(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): string {
    if (this.isGalleryImage(item)) {
      return item.image.isPublic ? 'bg-green-500' : 'bg-orange-500';
    }
    return 'bg-blue-500';
  }

  getBadgeText(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): string {
    if (this.isGalleryImage(item)) {
      return item.image.isPublic ? 'Public' : 'Privé';
    }
    return 'Événement';
  }

  getEventTitle(item: { type: 'gallery' | 'event'; image: GalleryImage | EventImage }): string | null {
    if (this.isEventImage(item) && item.image.event) {
      return item.image.event.title;
    }
    return null;
  }

  editImage(image: GalleryImage): void {
    const dialogRef = this.dialog.open(AddGalleryImageDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      disableClose: true,
      data: { image }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadImages();
      }
    });
  }

  deleteImage(image: GalleryImage): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette image ?`)) {
      this.galleryService.deleteImage(image.id).subscribe({
        next: () => {
          this.notification.showSuccess('Image supprimée avec succès !');
          this.loadImages();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression de l\'image.');
        }
      });
    }
  }

  setFilterType(type: 'all' | 'public' | 'private'): void {
    this.filterType = type;
    this.filterTypeSubject.next(type);
  }
}

