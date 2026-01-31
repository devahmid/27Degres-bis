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
  private menuObserver?: MutationObserver;
  private repositionInterval?: any;
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
    if (this.menuObserver) {
      this.menuObserver.disconnect();
    }
    if (this.repositionInterval) {
      clearInterval(this.repositionInterval);
    }
  }


  @HostListener('window:resize', [])
  onWindowResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
    // Repositionner le menu utilisateur s'il est ouvert
    if (this.menuTrigger?.menuOpen) {
      setTimeout(() => {
        this.repositionUserMenu();
      }, 100);
    }
  }
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
    // Repositionner le menu utilisateur s'il est ouvert lors du scroll
    if (this.menuTrigger?.menuOpen) {
      setTimeout(() => {
        this.repositionUserMenu();
      }, 10);
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
    // Forcer le positionnement du menu à droite du bouton
    if (this.menuTrigger) {
      // Observer les changements dans le DOM pour détecter immédiatement quand le menu est ajouté
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const pane = node.querySelector?.('.cdk-overlay-pane') || 
                          (node.classList?.contains('cdk-overlay-pane') ? node : null);
              if (pane) {
                // Repositionner immédiatement dès qu'un pane est ajouté
                requestAnimationFrame(() => {
                  this.forceMenuPosition();
                });
              }
            }
          });
        });
      });
      
      const overlayContainer = document.querySelector('.cdk-overlay-container');
      if (overlayContainer) {
        observer.observe(overlayContainer, {
          childList: true,
          subtree: true
        });
        this.menuObserver = observer;
      }
      
      this.menuTrigger.menuOpened.subscribe(() => {
        // Repositionner immédiatement avec requestAnimationFrame pour être le plus rapide possible
        requestAnimationFrame(() => {
          this.forceMenuPosition();
          requestAnimationFrame(() => {
            this.forceMenuPosition();
          });
        });
        
        // Répéter rapidement pour éviter le flash
        setTimeout(() => this.forceMenuPosition(), 0);
        setTimeout(() => this.forceMenuPosition(), 10);
        setTimeout(() => this.forceMenuPosition(), 20);
        setTimeout(() => this.forceMenuPosition(), 50);
        
        // Utiliser un interval très court pendant une courte période
        let count = 0;
        this.repositionInterval = setInterval(() => {
          this.forceMenuPosition();
          count++;
          if (count >= 5) { // Arrêter après 50ms (5 * 10ms)
            if (this.repositionInterval) {
              clearInterval(this.repositionInterval);
              this.repositionInterval = null;
            }
          }
        }, 10); // Interval très court
      });
      
      this.menuTrigger.menuClosed.subscribe(() => {
        if (this.repositionInterval) {
          clearInterval(this.repositionInterval);
          this.repositionInterval = null;
        }
      });
    }
  }
  
  private forceMenuPosition(): void {
    const menuButton = document.querySelector('.user-menu-button') as HTMLElement | null;
    if (!menuButton) {
      return;
    }
    
    // Trouver TOUS les panes et vérifier lequel contient notre menu
    const allPanes = Array.from(document.querySelectorAll('.cdk-overlay-pane')) as HTMLElement[];
    
    let userMenuPane: HTMLElement | null = null;
    
    // Chercher le pane qui contient un menu Material (peut avoir différentes classes)
    for (const pane of allPanes) {
      // Vérifier plusieurs sélecteurs possibles
      const hasUserMenuPanel = pane.querySelector('.user-menu-panel');
      const hasMatMenuPanel = pane.querySelector('.mat-mdc-menu-panel');
      const hasUserMenu = pane.querySelector('.user-menu');
      
      // Si c'est un menu Material et qu'il est visible, c'est probablement notre menu
      if (hasMatMenuPanel || hasUserMenuPanel || hasUserMenu) {
        // Vérifier qu'il n'est pas un dialog
        const isDialog = pane.querySelector('.mat-mdc-dialog-container');
        if (!isDialog) {
          userMenuPane = pane;
          break;
        }
      }
    }
    
    // Si toujours pas trouvé, prendre le dernier pane visible qui contient un menu
    if (!userMenuPane && allPanes.length > 0) {
      const visiblePanes = allPanes.filter(p => {
        const rect = p.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               window.getComputedStyle(p).display !== 'none' &&
               p.querySelector('.mat-mdc-menu-panel') &&
               !p.querySelector('.mat-mdc-dialog-container');
      });
      
      if (visiblePanes.length > 0) {
        // Prendre le dernier pane (le plus récent)
        userMenuPane = visiblePanes[visiblePanes.length - 1];
      }
    }
    
    if (!userMenuPane) {
      return;
    }
    
    const buttonRect = menuButton.getBoundingClientRect();
    const menuWidth = userMenuPane.offsetWidth || 260;
    const viewportWidth = window.innerWidth;
    const rightPosition = buttonRect.right;
    const leftPosition = Math.max(10, Math.min(rightPosition - menuWidth, viewportWidth - menuWidth - 10));
    
    // Forcer le positionnement de manière très agressive
    userMenuPane.style.cssText = `
      position: fixed !important;
      left: ${leftPosition}px !important;
      top: ${buttonRect.bottom + 8}px !important;
      transform: none !important;
      right: auto !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    `;
    
    // Forcer aussi sur le panel Material
    const menuPanel = userMenuPane.querySelector('.mat-mdc-menu-panel') as HTMLElement;
    if (menuPanel) {
      menuPanel.style.cssText = `
        margin-left: 0 !important;
        margin-right: 0 !important;
      `;
    }
  }
  
  private repositionUserMenu(): void {
    const menuButton = document.querySelector('.user-menu-button') as HTMLElement | null;
    if (!menuButton) {
      return;
    }
    
    // Chercher le pane qui contient le menu utilisateur
    const allPanes = Array.from(document.querySelectorAll('.cdk-overlay-pane')) as HTMLElement[];
    let userMenuPane: HTMLElement | null = null;
    
    for (const pane of allPanes) {
      const hasUserMenu = pane.querySelector('.user-menu-panel');
      if (hasUserMenu) {
        userMenuPane = pane;
        break;
      }
    }
    
    if (!userMenuPane) {
      return;
    }
    
    const buttonRect = menuButton.getBoundingClientRect();
    const menuWidth = userMenuPane.offsetWidth || 260;
    const rightPosition = buttonRect.right;
    const leftPosition = Math.max(10, rightPosition - menuWidth);
    
    // Vérifier si le menu est déjà à la bonne position pour éviter les recalculs inutiles
    const currentLeft = parseInt(userMenuPane.style.left) || 0;
    const targetLeft = leftPosition;
    
    if (Math.abs(currentLeft - targetLeft) > 5) {
      // Forcer le positionnement avec !important via setProperty
      userMenuPane.style.setProperty('position', 'fixed', 'important');
      userMenuPane.style.setProperty('left', `${leftPosition}px`, 'important');
      userMenuPane.style.setProperty('top', `${buttonRect.bottom + 8}px`, 'important');
      userMenuPane.style.setProperty('transform', 'none', 'important');
      userMenuPane.style.setProperty('right', 'auto', 'important');
      userMenuPane.style.setProperty('margin-left', '0', 'important');
      userMenuPane.style.setProperty('margin-right', '0', 'important');
      
      console.log('Menu repositionné à droite:', { 
        leftPosition, 
        rightPosition, 
        menuWidth, 
        buttonRect: { right: buttonRect.right, left: buttonRect.left },
        currentLeft,
        targetLeft
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

