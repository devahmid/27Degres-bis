import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Cotisation } from '../../../core/models/cotisation.model';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    DateFormatPipe
  ],
  template: `
    <!-- Welcome Section -->
    <section class="bg-gradient-to-r from-primary to-secondary text-white py-12 mt-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold mb-2">
              Bienvenue {{ (currentUser$ | async)?.firstName }} !
            </h2>
            <p class="text-xl opacity-90">Votre espace membre personnel</p>
            <div class="flex items-center mt-4 flex-wrap gap-4">
              <ng-container *ngIf="(cotisationStatus$ | async) as status">
                <div [ngClass]="{
                  'bg-green-500': status?.status === 'paid',
                  'bg-secondary': status?.status === 'pending',
                  'bg-red-500': status?.status === 'overdue'
                }" class="text-white px-4 py-2 rounded-full text-sm font-medium">
                  <mat-icon class="mr-2 align-middle text-sm">check_circle</mat-icon>
                  <span *ngIf="status?.status === 'paid'">Cotisation à jour</span>
                  <span *ngIf="status?.status === 'pending'">Cotisation en attente</span>
                  <span *ngIf="status?.status === 'overdue'">Cotisation en retard</span>
                </div>
              </ng-container>
              <span class="text-white opacity-75">Membre depuis {{ (currentUser$ | async)?.createdAt | dateFormat:'MMMM yyyy' }}</span>
            </div>
          </div>
          <div class="mt-6 md:mt-0">
            <div class="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
              <mat-icon class="text-5xl text-primary">account_circle</mat-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Dashboard Navigation -->
    <section class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4">
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8 overflow-x-auto py-4">
          <a routerLink="/member/dashboard" routerLinkActive="text-primary border-b-2 border-primary" 
             [routerLinkActiveOptions]="{exact: false}"
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">dashboard</mat-icon>Tableau de bord
          </a>
          <a routerLink="/member/profile" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">person</mat-icon>Mon Profil
          </a>
          <a routerLink="/member/membership" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">credit_card</mat-icon>Cotisations
          </a>
          <a routerLink="/member/directory" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">people</mat-icon>Annuaire
          </a>
          <a routerLink="/member/documents" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">description</mat-icon>Documents
          </a>
          <a routerLink="/member/gallery" routerLinkActive="text-primary border-b-2 border-primary" 
             class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
            <mat-icon class="mr-2 align-middle text-sm">photo_library</mat-icon>Galerie
          </a>
          <ng-container *ngIf="(currentUser$ | async)?.role === 'admin'">
            <a routerLink="/admin/dashboard" routerLinkActive="text-primary border-b-2 border-primary" 
               class="font-medium whitespace-nowrap pb-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">admin_panel_settings</mat-icon>Administration
            </a>
          </ng-container>
          <div class="ml-auto flex items-center">
            <button mat-stroked-button color="warn" (click)="logout()" class="flex items-center">
              <mat-icon class="mr-2">logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
        
        <!-- Mobile Navigation -->
        <div class="md:hidden py-4">
          <div class="flex items-center justify-between mb-2">
            <button mat-icon-button (click)="mobileMenuOpen = !mobileMenuOpen" type="button">
              <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
            </button>
            <button mat-stroked-button color="warn" (click)="logout()" class="flex items-center text-sm">
              <mat-icon class="mr-1 text-base">logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </div>
          <nav *ngIf="mobileMenuOpen" class="flex flex-col space-y-2">
            <a routerLink="/member/dashboard" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">dashboard</mat-icon>Tableau de bord
            </a>
            <a routerLink="/member/profile" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">person</mat-icon>Mon Profil
            </a>
            <a routerLink="/member/membership" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">credit_card</mat-icon>Cotisations
            </a>
            <a routerLink="/member/directory" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">people</mat-icon>Annuaire
            </a>
            <a routerLink="/member/documents" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">description</mat-icon>Documents
            </a>
            <a routerLink="/member/gallery" routerLinkActive="text-primary font-semibold" 
               (click)="mobileMenuOpen = false"
               class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <mat-icon class="mr-2 align-middle text-sm">photo_library</mat-icon>Galerie
            </a>
            <ng-container *ngIf="(currentUser$ | async)?.role === 'admin'">
              <a routerLink="/admin/dashboard" routerLinkActive="text-primary font-semibold" 
                 (click)="mobileMenuOpen = false"
                 class="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
                <mat-icon class="mr-2 align-middle text-sm">admin_panel_settings</mat-icon>Administration
              </a>
            </ng-container>
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
      background: linear-gradient(135deg, #E94E1B 0%, #F5B800 100%);
    }
    
    a[routerLinkActive].text-primary {
      border-bottom: 2px solid #E94E1B;
      color: #E94E1B !important;
    }
  `]
})
export class MemberLayoutComponent implements OnInit {
  currentUser$;
  cotisationStatus$!: Observable<Cotisation | null>;
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.cotisationStatus$ = this.http.get<Cotisation | null>(`${environment.apiUrl}/cotisations/current`);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

