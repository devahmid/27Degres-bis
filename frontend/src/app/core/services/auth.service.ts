import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    const user = this.storage.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.storage.setToken(response.accessToken);
          this.storage.setUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.storage.setToken(response.accessToken);
          this.storage.setUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    this.storage.clear();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.storage.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role || user?.role === 'admin';
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(
        tap(response => {
          this.storage.setToken(response.accessToken);
          this.storage.setUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  updateCurrentUser(user: User): void {
    this.storage.setUser(user);
    this.currentUserSubject.next(user);
  }
}

