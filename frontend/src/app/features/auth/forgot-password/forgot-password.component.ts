import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notification: NotificationService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.forgotPasswordForm.value)
        .subscribe({
          next: () => {
            this.emailSent = true;
            this.notification.showSuccess('Email de réinitialisation envoyé !');
            this.isSubmitting = false;
          },
          error: () => {
            this.notification.showError('Erreur lors de l\'envoi de l\'email');
            this.isSubmitting = false;
          }
        });
    }
  }
}









