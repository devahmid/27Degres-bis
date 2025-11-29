import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: () => {
          this.notification.showSuccess('Connexion réussie !');
          this.router.navigate(['/member/dashboard']);
        },
        error: (error) => {
          let errorMsg = 'Erreur de connexion';
          
          // Extract error message from different possible formats
          if (error.status === 401) {
            // Try to get message from error response
            if (error.error?.message) {
              errorMsg = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMsg = error.error;
            } else {
              errorMsg = 'Email ou mot de passe incorrect';
            }
          } else if (error.status === 0) {
            errorMsg = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.errorMessage = errorMsg;
          this.notification.showError(errorMsg);
          this.isSubmitting = false;
        }
      });
    }
  }
}

