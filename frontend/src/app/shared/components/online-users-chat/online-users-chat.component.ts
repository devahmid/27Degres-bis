import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RealtimeService, OnlineUser, ChatMessage } from '../../../core/services/realtime.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-online-users-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-4 items-end" style="z-index: 99999 !important; position: fixed !important; bottom: 1rem !important; right: 1rem !important; display: flex !important; visibility: visible !important; opacity: 1 !important;">
      <!-- Online Users Card -->
      <mat-card class="shadow-lg" *ngIf="showOnlineUsers">
        <mat-card-header class="bg-primary text-white p-4">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <mat-icon [matBadge]="onlineUsers.length" [matBadgeHidden]="onlineUsers.length === 0" matBadgeColor="accent" matBadgePosition="above after">people</mat-icon>
              <span class="font-bold">En ligne</span>
            </div>
            <button mat-icon-button (click)="toggleOnlineUsers()" class="text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </mat-card-header>
        <mat-card-content class="p-4 max-h-64 overflow-y-auto">
          <div *ngIf="onlineUsers.length === 0" class="text-center text-gray-500 py-4">
            Aucun utilisateur en ligne
          </div>
          <div *ngFor="let user of onlineUsers" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="font-medium" [class.text-primary]="user.userId === currentUserId" [class.font-bold]="user.userId === currentUserId">
              {{ user.userId === currentUserId ? 'Moi' : (user.firstName + ' ' + user.lastName) }}
            </span>
            <span class="text-xs text-gray-500 capitalize">({{ user.role }})</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Chat Card -->
      <mat-card class="shadow-lg" *ngIf="showChat">
        <mat-card-header class="bg-secondary text-white p-4">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <mat-icon>chat</mat-icon>
              <span class="font-bold">Chat Global</span>
            </div>
            <button mat-icon-button (click)="toggleChat()" class="text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </mat-card-header>
        <mat-card-content class="p-0">
          <!-- Messages -->
          <div #messagesContainer class="p-4 h-64 overflow-y-auto bg-gray-50">
            <div *ngIf="chatMessages.length === 0" class="text-center text-gray-500 py-8">
              Aucun message. Soyez le premier à écrire !
            </div>
            <div *ngFor="let msg of chatMessages" class="mb-4">
              <div class="flex items-start gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" 
                     [class.bg-primary]="msg.userId === currentUserId"
                     [class.bg-gray-500]="msg.userId !== currentUserId">
                  {{ msg.userId === currentUserId ? 'M' : (msg.firstName.charAt(0) + msg.lastName.charAt(0)) }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-sm" 
                          [class.text-primary]="msg.userId === currentUserId"
                          [class.text-gray-700]="msg.userId !== currentUserId">
                      {{ msg.userId === currentUserId ? 'Moi' : (msg.firstName + ' ' + msg.lastName) }}
                    </span>
                    <span class="text-xs text-gray-500">{{ formatTime(msg.timestamp) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 bg-white p-2 rounded-lg" 
                     [class.bg-primary]="msg.userId === currentUserId"
                     [class.text-white]="msg.userId === currentUserId"
                     [class.bg-gray-50]="msg.userId !== currentUserId">
                    {{ msg.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Input -->
          <div class="p-4 border-t bg-white">
            <form (ngSubmit)="sendMessage()" class="flex gap-2">
              <input
                [(ngModel)]="newMessage"
                (keydown.enter)="sendMessage()"
                name="newMessage"
                placeholder="Tapez votre message..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                [disabled]="!isConnected">
              <button
                type="submit"
                mat-raised-button
                color="primary"
                [disabled]="!newMessage.trim() || !isConnected">
                <mat-icon>send</mat-icon>
              </button>
            </form>
            <p *ngIf="!isConnected" class="text-xs text-red-500 mt-2">
              <mat-icon class="text-xs align-middle">warning</mat-icon>
              Connexion perdue. Reconnexion en cours...
            </p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Toggle Buttons - Toujours visibles en bas à droite, même quand les cartes sont ouvertes -->
      <div class="flex flex-col gap-3" 
           style="position: relative !important; display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 10000 !important;">
        <button
          mat-fab
          color="primary"
          (click)="toggleOnlineUsers()"
          matTooltip="Utilisateurs en ligne"
          class="shadow-lg"
          [class.mat-elevation-z8]="showOnlineUsers"
          style="display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important;">
          <mat-icon [matBadge]="onlineUsers.length" [matBadgeHidden]="onlineUsers.length === 0" matBadgeColor="accent" matBadgePosition="above after">people</mat-icon>
        </button>
        <button
          mat-fab
          color="accent"
          (click)="toggleChat()"
          matTooltip="Chat global"
          class="shadow-lg"
          [class.mat-elevation-z8]="showChat"
          style="display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important;">
          <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn" matBadgePosition="above after">chat</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block !important;
      position: fixed !important;
      bottom: 1rem !important;
      right: 1rem !important;
      z-index: 99999 !important;
      pointer-events: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    mat-card {
      min-width: 350px;
      max-width: 400px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
    }
    .mat-mdc-card-header {
      border-radius: 4px 4px 0 0;
    }
    button[mat-fab] {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
      width: 56px !important;
      height: 56px !important;
      position: relative !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    button[mat-fab]:hover {
      transform: scale(1.05);
      transition: transform 0.2s;
    }
  `]
})
export class OnlineUsersChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  onlineUsers: OnlineUser[] = [];
  chatMessages: ChatMessage[] = [];
  newMessage = '';
  showOnlineUsers = false;
  showChat = false;
  isConnected = false;
  unreadCount = 0;

  private subscriptions: Subscription[] = [];

  currentUserId: number | null = null;

  constructor(
    private realtimeService: RealtimeService,
    private notification: NotificationService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || null;
  }

  ngOnInit(): void {
    // Connecter au WebSocket seulement si l'utilisateur est authentifié
    const token = localStorage.getItem('auth_token');
    if (token) {
      setTimeout(() => {
        this.realtimeService.connect();
      }, 500);
    }

    // S'abonner aux utilisateurs en ligne
    this.subscriptions.push(
      this.realtimeService.getOnlineUsers().subscribe(users => {
        console.log('Online users updated:', users);
        this.onlineUsers = users;
      })
    );

    // S'abonner aux nouveaux messages
    this.subscriptions.push(
      this.realtimeService.getNewMessages().subscribe(message => {
        this.chatMessages.push(message);
        this.scrollToBottom();
        
        // Si le chat n'est pas ouvert, incrémenter le compteur de messages non lus
        // Ne pas notifier si c'est l'utilisateur actuel qui envoie le message
        if (!this.showChat && message.userId !== this.currentUserId) {
          this.unreadCount++;
          this.notification.showInfo(`${message.firstName} ${message.lastName}: ${message.message.substring(0, 50)}...`);
        }
      })
    );

    // S'abonner aux notifications d'utilisateurs en ligne
    this.subscriptions.push(
      this.realtimeService.getUserOnline().subscribe(user => {
        // Ne pas notifier si c'est l'utilisateur actuel qui se connecte
        if (user.userId !== this.currentUserId && !this.showOnlineUsers) {
          this.notification.showSuccess(`${user.firstName} ${user.lastName} est maintenant en ligne`);
        }
      })
    );

    // S'abonner au statut de connexion
    this.subscriptions.push(
      this.realtimeService.isConnected().subscribe(connected => {
        this.isConnected = connected;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Ne pas déconnecter ici car le service peut être utilisé ailleurs
  }

  toggleOnlineUsers(): void {
    this.showOnlineUsers = !this.showOnlineUsers;
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
    if (this.showChat) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.isConnected) {
      this.realtimeService.sendMessage(this.newMessage.trim());
      this.newMessage = '';
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTime(timestamp: Date | string): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
