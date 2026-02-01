import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <!-- Admin Header -->
    <section class="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold mb-2">
              Administration
            </h2>
            <p class="text-lg opacity-90">Gestion de l'Association 27 Degrés</p>
          </div>
          <button mat-stroked-button color="warn" (click)="logout()" class="mt-4 md:mt-0 flex items-center">
            <mat-icon class="mr-2">logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Admin Navigation -->
    <section class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8 overflow-x-auto py-4">
          <a routerLink="/admin/dashboard" routerLinkActive="text-primary border-b-2 border-primary" 
             [routerLinkActiveOptions]="{exact: false}"
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">dashboard</mat-icon>Tableau de bord
          </a>
          <a routerLink="/admin/members" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">people</mat-icon>Membres
          </a>
          <a routerLink="/admin/cotisations" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">credit_card</mat-icon>Cotisations
          </a>
          <a routerLink="/admin/events" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">event</mat-icon>Événements
          </a>
          <a routerLink="/admin/posts" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">article</mat-icon>Actualités
          </a>
            <a routerLink="/admin/comments" routerLinkActive="text-primary border-b-2 border-primary" 
              class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">comment</mat-icon>Commentaires
            </a>
            <a routerLink="/admin/ideas" routerLinkActive="text-primary border-b-2 border-primary" 
              class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">lightbulb</mat-icon>Idées
            </a>
            <a routerLink="/admin/gallery" routerLinkActive="text-primary border-b-2 border-primary" 
              class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">photo_library</mat-icon>Photothèque
            </a>
            <a routerLink="/admin/products" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">shopping_bag</mat-icon>Boutique
          </a>
            <a routerLink="/admin/orders" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">shopping_cart</mat-icon>Commandes
          </a>
            <a routerLink="/admin/delivery-methods" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">local_shipping</mat-icon>Livraison
          </a>
            <a routerLink="/admin/statistics" routerLinkActive="text-primary border-b-2 border-primary"
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">bar_chart</mat-icon>Statistiques
          </a>
            <a routerLink="/admin/contact-messages" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">mail</mat-icon>Messages
          </a>
            <a routerLink="/admin/broadcast" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">campaign</mat-icon>Email général
          </a>
            <a routerLink="/admin/accounting/dashboard" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">account_balance</mat-icon>Comptabilité
          </a>
        </nav>
        
        <!-- Mobile Navigation -->
        <div class="md:hidden py-4">
          <div class="flex items-center justify-between mb-2">
            <button mat-icon-button (click)="mobileMenuOpen = !mobileMenuOpen" type="button">
              <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
          <nav *ngIf="mobileMenuOpen" class="flex flex-col space-y-2">
            <a routerLink="/admin/dashboard" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">dashboard</mat-icon>Tableau de bord
            </a>
            <a routerLink="/admin/members" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">people</mat-icon>Membres
            </a>
            <a routerLink="/admin/cotisations" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">credit_card</mat-icon>Cotisations
            </a>
            <a routerLink="/admin/events" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">event</mat-icon>Événements
            </a>
            <a routerLink="/admin/posts" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">article</mat-icon>Actualités
            </a>
              <a routerLink="/admin/comments" routerLinkActive="text-primary font-semibold" 
                (click)="mobileMenuOpen = false"
                class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
                <mat-icon class="mr-2 align-middle text-sm">comment</mat-icon>Commentaires
              </a>
              <a routerLink="/admin/ideas" routerLinkActive="text-primary font-semibold" 
                (click)="mobileMenuOpen = false"
                class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
                <mat-icon class="mr-2 align-middle text-sm">lightbulb</mat-icon>Idées
              </a>
              <a routerLink="/admin/gallery" routerLinkActive="text-primary font-semibold" 
                (click)="mobileMenuOpen = false"
                class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
                <mat-icon class="mr-2 align-middle text-sm">photo_library</mat-icon>Photothèque
              </a>
              <a routerLink="/admin/products" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">shopping_bag</mat-icon>Boutique
            </a>
              <a routerLink="/admin/orders" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">shopping_cart</mat-icon>Commandes
            </a>
              <a routerLink="/admin/delivery-methods" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">local_shipping</mat-icon>Livraison
            </a>
              <a routerLink="/admin/statistics" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">bar_chart</mat-icon>Statistiques
            </a>
              <a routerLink="/admin/contact-messages" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">mail</mat-icon>Messages
            </a>
              <a routerLink="/admin/broadcast" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">campaign</mat-icon>Email général
            </a>
              <a routerLink="/admin/accounting/dashboard" routerLinkActive="text-primary font-semibold"
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">account_balance</mat-icon>Comptabilité
            </a>
          </nav>
        </div>
      </div>
    </section>

    <!-- Page Content -->
    <section class="py-8 bg-light min-h-screen">
      <router-outlet></router-outlet>
    </section>
  `,
  styles: [`
    section.bg-gradient-to-r {
      background: linear-gradient(135deg, #DC2626 0%, #EA580C 100%);
    }
    
    a[routerLinkActive].text-primary {
      border-bottom: 2px solid #E94E1B;
      color: #E94E1B !important;
    }
  `]
})
export class AdminLayoutComponent {
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

