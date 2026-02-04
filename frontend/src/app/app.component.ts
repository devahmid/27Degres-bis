import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { OnlineUsersChatComponent } from './shared/components/online-users-chat/online-users-chat.component';
import { AuthService } from './core/services/auth.service';
import { RealtimeService } from './core/services/realtime.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, OnlineUsersChatComponent],
  template: `
    <div class="flex flex-col min-h-screen" style="position: relative; z-index: 1;">
      <app-header></app-header>
      <main class="flex-grow" style="position: relative; z-index: 1; padding-top: 80px;">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-online-users-chat *ngIf="isAuthenticated"></app-online-users-chat>
    </div>
  `,
  styles: [`
    @media (max-width: 768px) {
      main {
        padding-top: 70px !important;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Association 27 Degrés';
  isAuthenticated = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private realtimeService: RealtimeService
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté de plusieurs façons
    const checkAuth = () => {
      const initialUser = this.authService.getCurrentUser();
      const hasToken = this.authService.isLoggedIn();
      this.isAuthenticated = !!initialUser || hasToken;
      return this.isAuthenticated;
    };
    
    // Vérifier immédiatement
    checkAuth();
    
    // Vérifier aussi après un petit délai (au cas où le token serait chargé après)
    setTimeout(() => {
      checkAuth();
    }, 500);
    
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        const token = this.authService.isLoggedIn();
        this.isAuthenticated = !!user || token;
        if (this.isAuthenticated) {
          // Connecter au WebSocket si l'utilisateur est authentifié
          setTimeout(() => {
            this.realtimeService.connect();
          }, 1000); // Petit délai pour s'assurer que le token est disponible
        } else {
          // Déconnecter du WebSocket si l'utilisateur se déconnecte
          this.realtimeService.disconnect();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

