import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './posts-management.component.html',
  styleUrl: './posts-management.component.scss'
})
export class PostsManagementComponent implements OnInit, OnDestroy {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();
  filteredPosts$!: Observable<Post[]>;
  searchTerm = '';
  filterCategory = '';
  filterStatus = '';
  displayedColumns: string[] = ['title', 'category', 'author', 'publishDate', 'status', 'views', 'actions'];
  openMenuId: number | null = null;
  private clickTimeout: any = null;
  private positionInterval: any = null;

  constructor(
    private postsService: PostsService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    
    // Repositionner le menu lors du scroll
    window.addEventListener('scroll', () => {
      if (this.openMenuId !== null) {
        this.positionMenu(this.openMenuId);
      }
    }, true);
  }

  ngOnDestroy(): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
    }
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    this.closeMenus();
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
    this.closeMenus();
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
    this.closeMenus();
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

  toggleMenu(postId: number, mouseEvent?: MouseEvent): void {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }
    this.openMenuId = this.openMenuId === postId ? null : postId;
    
    // Positionner le menu dynamiquement si ouvert
    if (this.openMenuId === postId) {
      setTimeout(() => {
        this.positionMenu(postId);
      }, 0);
      
      // Repositionner continuellement pendant que le menu est ouvert
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
      }
      this.positionInterval = setInterval(() => {
        if (this.openMenuId === postId) {
          this.positionMenu(postId);
        } else {
          clearInterval(this.positionInterval);
        }
      }, 100);
    } else {
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
        this.positionInterval = null;
      }
    }
  }

  closeMenus(): void {
    if (this.openMenuId !== null) {
      const menu = document.querySelector(`[data-menu-post-id="${this.openMenuId}"]`) as HTMLElement;
      if (menu) {
        // Trouver le td parent original
        const button = document.querySelector(`[data-post-id="${this.openMenuId}"]`) as HTMLElement;
        if (button) {
          const originalTd = button.closest('td');
          if (originalTd && menu.parentElement === document.body) {
            originalTd.appendChild(menu);
          }
        }
      }
    }
    this.openMenuId = null;
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isMenuButton = target.closest('[data-post-id]');
    const isMenuDropdown = target.closest('.menu-dropdown');
    const isMenuItem = target.closest('.menu-item');

    if (!isMenuButton && !isMenuDropdown && !isMenuItem) {
      this.clickTimeout = setTimeout(() => {
        this.closeMenus();
      }, 0);
    } else if (isMenuButton || isMenuDropdown || isMenuItem) {
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }
    }
  }

  private positionMenu(postId: number): void {
    const button = document.querySelector(`[data-post-id="${postId}"]`) as HTMLElement;
    const menu = document.querySelector(`[data-menu-post-id="${postId}"]`) as HTMLElement;
    
    if (!button || !menu) return;

    const buttonRect = button.getBoundingClientRect();
    const footer = document.querySelector('app-footer') as HTMLElement;
    const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
    const footerZIndex = footer ? parseInt(window.getComputedStyle(footer).zIndex || '0') : 0;

    // Déplacer le menu vers document.body pour éviter les problèmes de z-index
    const originalParent = menu.parentElement;
    const originalTd = originalParent && originalParent.tagName === 'TD' ? originalParent : null;
    if (originalParent && originalParent.tagName !== 'BODY') {
      document.body.appendChild(menu);
    }

    // Attendre que le menu soit dans le DOM pour calculer sa hauteur
    setTimeout(() => {
      const menuHeight = menu.offsetHeight || 200;
      
      // Calculer la position du menu
      let top = buttonRect.bottom + 4;
      
      // Vérifier si le menu dépasse le footer ou le bas de l'écran
      if (top + menuHeight > footerTop || top + menuHeight > window.innerHeight) {
        top = buttonRect.top - menuHeight - 4;
        if (top < 0) {
          top = 4;
        }
      }

      const left = buttonRect.right - (menu.offsetWidth || 200);
      const zIndex = Math.max(100000, footerZIndex + 100000);

      menu.style.cssText = `
        position: fixed !important;
        left: ${left}px !important;
        top: ${top}px !important;
        z-index: ${zIndex} !important;
        background: white !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        border: 1px solid #e5e7eb !important;
        padding: 0.5rem !important;
        min-width: 200px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 !important;
      `;
    }, 0);
  }
}
