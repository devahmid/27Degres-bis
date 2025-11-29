import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { GalleryService, GalleryImage } from '../../../core/services/gallery.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AddGalleryImageDialogComponent } from './add-gallery-image-dialog.component';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-gallery-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    DateFormatPipe
  ],
  templateUrl: './gallery-management.component.html',
  styleUrl: './gallery-management.component.scss'
})
export class GalleryManagementComponent implements OnInit {
  private imagesSubject = new BehaviorSubject<GalleryImage[]>([]);
  images$ = this.imagesSubject.asObservable();
  filteredImages$!: Observable<GalleryImage[]>;
  searchTerm = '';
  filterVisibility: 'all' | 'public' | 'private' = 'all';
  filterCategory = '';

  constructor(
    private galleryService: GalleryService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadImages();
    this.filteredImages$ = this.images$.pipe(
      map(images => {
        let filtered = [...images];

        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(img =>
            img.caption?.toLowerCase().includes(term) ||
            img.category?.toLowerCase().includes(term)
          );
        }

        if (this.filterVisibility === 'public') {
          filtered = filtered.filter(img => img.isPublic);
        } else if (this.filterVisibility === 'private') {
          filtered = filtered.filter(img => !img.isPublic);
        }

        if (this.filterCategory) {
          filtered = filtered.filter(img => img.category === this.filterCategory);
        }

        return filtered;
      })
    );
  }

  loadImages(): void {
    this.galleryService.getAllImages().subscribe({
      next: (images) => {
        this.imagesSubject.next(images);
      },
      error: (err) => {
        this.notification.showError('Erreur lors du chargement des images.');
      }
    });
  }

  onSearchChange(): void {
    this.imagesSubject.next(this.imagesSubject.getValue());
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

  getCategories(): string[] {
    const images = this.imagesSubject.getValue();
    const categories = new Set<string>();
    images.forEach(img => {
      if (img.category) {
        categories.add(img.category);
      }
    });
    return Array.from(categories).sort();
  }
}
