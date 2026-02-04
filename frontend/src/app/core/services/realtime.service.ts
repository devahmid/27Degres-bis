import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface OnlineUser {
  userId: number;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private socket: Socket | null = null;
  private onlineUsers$ = new BehaviorSubject<OnlineUser[]>([]);
  private newMessage$ = new Subject<ChatMessage>();
  private userOnline$ = new Subject<{ userId: number; firstName: string; lastName: string }>();
  private userOffline$ = new Subject<{ userId: number }>();
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    const socketUrl = environment.apiUrl.replace('/api', '');
    
    this.socket = io(`${socketUrl}/realtime`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected$.next(false);
    });

    this.socket.on('users:online', (users: OnlineUser[]) => {
      this.onlineUsers$.next(users);
    });

    this.socket.on('user:online', (user: { userId: number; firstName: string; lastName: string }) => {
      this.userOnline$.next(user);
      // Mettre à jour la liste des utilisateurs en ligne
      const currentUsers = this.onlineUsers$.value;
      if (!currentUsers.find(u => u.userId === user.userId)) {
        this.onlineUsers$.next([...currentUsers, { ...user, role: 'membre' }]);
      }
    });

    this.socket.on('user:offline', (data: { userId: number }) => {
      this.userOffline$.next(data);
      // Retirer l'utilisateur de la liste
      const currentUsers = this.onlineUsers$.value.filter(u => u.userId !== data.userId);
      this.onlineUsers$.next(currentUsers);
    });

    this.socket.on('chat:messages', (messages: ChatMessage[]) => {
      // Les messages historiques sont reçus à la connexion
    });

    this.socket.on('chat:new-message', (message: ChatMessage) => {
      this.newMessage$.next(message);
    });

    this.socket.on('connect_error', () => {
      this.connected$.next(false);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }

  sendMessage(message: string): void {
    if (this.socket?.connected) {
      this.socket.emit('chat:message', { message });
    }
  }

  getOnlineUsers(): Observable<OnlineUser[]> {
    return this.onlineUsers$.asObservable();
  }

  getNewMessages(): Observable<ChatMessage> {
    return this.newMessage$.asObservable();
  }

  getUserOnline(): Observable<{ userId: number; firstName: string; lastName: string }> {
    return this.userOnline$.asObservable();
  }

  getUserOffline(): Observable<{ userId: number }> {
    return this.userOffline$.asObservable();
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  getOnlineUsersCount(): number {
    return this.onlineUsers$.value.length;
  }
}
