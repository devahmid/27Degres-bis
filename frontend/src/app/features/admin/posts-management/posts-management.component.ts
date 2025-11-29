import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PostsService, Post } from '../../../core/services/posts.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AddPostDialogComponent } from './add-post-dialog.component';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-posts-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './posts-management.component.html',
  styleUrl: './posts-management.component.scss'
})
export class PostsManagementComponent implements OnInit {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();
  filteredPosts$!: Observable<Post[]>;
  searchTerm = '';
  filterCategory = '';
  filterStatus = '';
  displayedColumns: string[] = ['title', 'category', 'author', 'publishDate', 'status', 'views', 'actions'];

  constructor(
    private postsService: PostsService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postsService.getAllPosts().subscribe({
      next: (posts) => {
        this.postsSubject.next(posts);
      },
      error: (err) => {
        this.notification.showError('Erreur lors du chargement des actualités.');
      }
    });

    this.filteredPosts$ = combineLatest([
      this.posts$,
      this.postsSubject.asObservable().pipe(
        map(() => this.searchTerm),
        startWith(this.searchTerm)
      ),
      this.postsSubject.asObservable().pipe(
        map(() => this.filterCategory),
        startWith(this.filterCategory)
      ),
      this.postsSubject.asObservable().pipe(
        map(() => this.filterStatus),
        startWith(this.filterStatus)
      )
    ]).pipe(
      map(([posts, searchTerm, filterCategory, filterStatus]) => {
        let filtered = [...posts];

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.excerpt?.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term)
          );
        }

        if (filterCategory) {
          filtered = filtered.filter(p => p.category === filterCategory);
        }

        if (filterStatus) {
          filtered = filtered.filter(p => p.status === filterStatus);
        }

        return filtered;
      })
    );
  }

  onSearchChange(): void {
    this.postsSubject.next(this.postsSubject.getValue());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddPostDialogComponent, {
      width: '90%',
      maxWidth: '1000px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  editPost(post: Post): void {
    const dialogRef = this.dialog.open(AddPostDialogComponent, {
      width: '90%',
      maxWidth: '1000px',
      disableClose: true,
      data: post
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  deletePost(post: Post): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'actualité "${post.title}" ?`)) {
      this.postsService.deletePost(post.id).subscribe({
        next: () => {
          this.notification.showSuccess(`Actualité "${post.title}" supprimée !`);
          this.loadPosts();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression de l\'actualité.');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'draft': 'Brouillon',
      'published': 'Publié'
    };
    return labels[status] || status;
  }
}
