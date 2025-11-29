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
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue(user);
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

