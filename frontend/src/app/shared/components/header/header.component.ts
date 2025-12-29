import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/orders.service';
import { Subscription, filter, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  currentUser$;
  isScrolled = false;
  isMobileMenuOpen = false;
  cartItemCount$ = new BehaviorSubject<number>(0);
  private routerSubscription?: Subscription;
  @ViewChild('menuTrigger') menuTrigger?: MatMenuTrigger;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.updateCartCount();
  }

  updateCartCount(): void {
    this.cartItemCount$.next(this.cartService.getCartItemCount());
  }

  ngOnInit() {
    // Close mobile menu when route changes and update cart count
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
        this.updateCartCount();
      });
    
    // Écouter les changements du panier
    this.cartService.cartUpdated.subscribe(() => {
      this.updateCartCount();
    });
    
    // S'assurer que le menu s'ouvre à droite
    if (this.menuTrigger) {
      // Forcer le positionnement après l'initialisation
      setTimeout(() => {
        // Le menu sera positionné correctement par Angular Material
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Fermer le menu utilisateur si on clique en dehors
    if (this.menuTrigger?.menuOpen) {
      const target = event.target as HTMLElement;
      const menuButton = target.closest('.user-menu-button');
      const menuPanel = target.closest('.mat-mdc-menu-panel');
      
      // Si on clique en dehors du bouton et du menu, fermer le menu
      if (!menuButton && !menuPanel) {
        this.menuTrigger.closeMenu();
      }
    }
  }

  ngAfterViewInit() {
    // Forcer le positionnement du menu aligné à droite sous l'icône
    if (this.menuTrigger) {
      // Écouter l'ouverture du menu pour ajuster le positionnement
      this.menuTrigger.menuOpened.subscribe(() => {
        setTimeout(() => {
          const menuPanel = document.querySelector('.user-menu-panel');
          const menuButton = document.querySelector('.user-menu-button');
          
          if (menuPanel && menuButton) {
            const buttonRect = menuButton.getBoundingClientRect();
            const panel = menuPanel as HTMLElement;
            const overlayPane = panel.closest('.cdk-overlay-pane') as HTMLElement;
            
            if (overlayPane) {
              const menuWidth = overlayPane.offsetWidth;
              // Aligner le bord droit du menu avec le bord droit du bouton
              const leftPosition = buttonRect.right - menuWidth;
              overlayPane.style.left = `${leftPosition}px`;
              overlayPane.style.top = `${buttonRect.bottom + 8}px`;
              overlayPane.style.transform = 'none';
            }
          }
        }, 0);
      });
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Forcer le menu à s'afficher
      setTimeout(() => {
        const menu = document.querySelector('.mobile-nav');
        if (menu) {
          menu.classList.add('open');
        }
      }, 10);
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  onMenuClosed(): void {
    // Le menu est fermé, rien à faire de spécial
  }
}

