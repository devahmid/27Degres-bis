import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser$;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private notification: NotificationService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      addressStreet: [''],
      addressCity: [''],
      addressPostalCode: [''],
      consentAnnuaire: [false],
      consentNewsletter: [false]
    });
  }

  ngOnInit(): void {
    // Charger les données fraîches depuis le backend
    this.loadProfile();
    
    // Également écouter les changements de currentUser$ pour la réactivité
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          addressStreet: user.addressStreet || '',
          addressCity: user.addressCity || '',
          addressPostalCode: user.addressPostalCode || '',
          consentAnnuaire: user.consentAnnuaire || false,
          consentNewsletter: user.consentNewsletter || false
        });
      }
    });
  }

  loadProfile(): void {
    this.http.get<User>(`${environment.apiUrl}/users/profile`)
      .subscribe({
        next: (user) => {
          // Mettre à jour le formulaire avec toutes les données
          this.profileForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            addressStreet: user.addressStreet || '',
            addressCity: user.addressCity || '',
            addressPostalCode: user.addressPostalCode || '',
            consentAnnuaire: user.consentAnnuaire || false,
            consentNewsletter: user.consentNewsletter || false
          });
          // Mettre à jour l'utilisateur dans le service d'authentification
          this.authService.updateCurrentUser(user);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil:', error);
          // En cas d'erreur, utiliser les données locales comme fallback
          const localUser = this.authService.getCurrentUser();
          if (localUser) {
            this.profileForm.patchValue({
              firstName: localUser.firstName || '',
              lastName: localUser.lastName || '',
              email: localUser.email || '',
              phone: localUser.phone || '',
              addressStreet: localUser.addressStreet || '',
              addressCity: localUser.addressCity || '',
              addressPostalCode: localUser.addressPostalCode || '',
              consentAnnuaire: localUser.consentAnnuaire || false,
              consentNewsletter: localUser.consentNewsletter || false
            });
          }
        }
      });
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.http.patch<User>(`${environment.apiUrl}/users/profile`, this.profileForm.value)
        .subscribe({
          next: (user) => {
            this.notification.showSuccess('Profil mis à jour avec succès !');
            this.authService.updateCurrentUser(user);
            this.isSubmitting = false;
          },
          error: () => {
            this.notification.showError('Erreur lors de la mise à jour du profil');
            this.isSubmitting = false;
          }
        });
    }
  }
}

