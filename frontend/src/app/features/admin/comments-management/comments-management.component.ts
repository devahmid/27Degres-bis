import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { RouterModule } from '@angular/router';

export interface Comment {
  id: number;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  post?: {
    id: number;
    title: string;
    slug: string;
  };
}

@Component({
  selector: 'app-comments-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DateFormatPipe
  ],
  templateUrl: './comments-management.component.html',
  styleUrl: './comments-management.component.scss'
})
export class CommentsManagementComponent implements OnInit, OnDestroy {
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  comments$ = this.commentsSubject.asObservable();
  filteredComments$!: Observable<Comment[]>;
  filterApproved = '';
  searchTerm = '';
  displayedColumns: string[] = ['post', 'user', 'content', 'status', 'createdAt', 'actions'];
  openMenuId: number | null = null;
  private clickTimeout: any = null;
  private positionInterval: any = null;

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadComments();
    
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

  loadComments(): void {
    this.http.get<Comment[]>(`${environment.apiUrl}/posts/admin/comments`).subscribe({
      next: (comments) => {
        this.commentsSubject.next(comments);
      },
      error: (err) => {
        this.notification.showError('Erreur lors du chargement des commentaires.');
      }
    });

    this.filteredComments$ = combineLatest([
      this.comments$,
      this.commentsSubject.asObservable().pipe(
        map(() => this.searchTerm),
        startWith(this.searchTerm)
      ),
      this.commentsSubject.asObservable().pipe(
        map(() => this.filterApproved),
        startWith(this.filterApproved)
      )
    ]).pipe(
      map(([comments, searchTerm, filterApproved]) => {
        let filtered = [...comments];

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(c =>
            c.content.toLowerCase().includes(term) ||
            c.user?.firstName.toLowerCase().includes(term) ||
            c.user?.lastName.toLowerCase().includes(term) ||
            c.post?.title.toLowerCase().includes(term)
          );
        }

        if (filterApproved === 'approved') {
          filtered = filtered.filter(c => c.isApproved);
        } else if (filterApproved === 'unapproved') {
          filtered = filtered.filter(c => !c.isApproved);
        }

        return filtered;
      })
    );
  }

  onSearchChange(): void {
    this.commentsSubject.next(this.commentsSubject.getValue());
  }

  approveComment(comment: Comment): void {
    this.closeMenus();
    this.http.patch(`${environment.apiUrl}/posts/comments/${comment.id}/approve`, {}).subscribe({
      next: () => {
        this.notification.showSuccess('Commentaire approuvé !');
        this.loadComments();
      },
      error: () => {
        this.notification.showError('Erreur lors de l\'approbation du commentaire.');
      }
    });
  }

  deleteComment(comment: Comment): void {
    this.closeMenus();
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce commentaire ?`)) {
      this.http.delete(`${environment.apiUrl}/posts/comments/${comment.id}`).subscribe({
        next: () => {
          this.notification.showSuccess('Commentaire supprimé !');
          this.loadComments();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression du commentaire.');
        }
      });
    }
  }

  toggleMenu(commentId: number, mouseEvent?: MouseEvent): void {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }
    this.openMenuId = this.openMenuId === commentId ? null : commentId;
    
    // Positionner le menu dynamiquement si ouvert
    if (this.openMenuId === commentId) {
      setTimeout(() => {
        this.positionMenu(commentId);
      }, 0);
      
      // Repositionner continuellement pendant que le menu est ouvert
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
      }
      this.positionInterval = setInterval(() => {
        if (this.openMenuId === commentId) {
          this.positionMenu(commentId);
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
      const menu = document.querySelector(`[data-menu-comment-id="${this.openMenuId}"]`) as HTMLElement;
      if (menu) {
        // Trouver le td parent original
        const button = document.querySelector(`[data-comment-id="${this.openMenuId}"]`) as HTMLElement;
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
    const isMenuButton = target.closest('[data-comment-id]');
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

  private positionMenu(commentId: number): void {
    const button = document.querySelector(`[data-comment-id="${commentId}"]`) as HTMLElement;
    const menu = document.querySelector(`[data-menu-comment-id="${commentId}"]`) as HTMLElement;
    
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









