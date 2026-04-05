import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

enum RecipientType {
  ALL_ACTIVE = 'all_active',
  NEWSLETTER_SUBSCRIBERS = 'newsletter_subscribers',
  CUSTOM = 'custom',
  SINGLE_MEMBER = 'single_member',
}

@Component({
  selector: 'app-broadcast-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './broadcast-email.component.html',
  styleUrl: './broadcast-email.component.scss'
})
export class BroadcastEmailComponent implements OnInit {
  broadcastForm: FormGroup;
  isSubmitting = false;
  recipientType = RecipientType;
  customEmails: string[] = [];
  customEmailInput = '';
  lastResult: { sent: number; failed: number } | null = null;
  users$!: Observable<User[]>;
  singleMemberId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notification: NotificationService
  ) {
    this.broadcastForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      recipientType: [RecipientType.NEWSLETTER_SUBSCRIBERS, Validators.required],
    });
  }

  ngOnInit(): void {
    this.users$ = this.http.get<User[]>(`${environment.apiUrl}/users/admin/all`);
  }

  get currentRecipientType(): RecipientType {
    return this.broadcastForm.get('recipientType')?.value;
  }

  addCustomEmail(): void {
    const email = this.customEmailInput.trim();
    if (email && this.isValidEmail(email) && !this.customEmails.includes(email)) {
      this.customEmails.push(email);
      this.customEmailInput = '';
    }
  }

  removeCustomEmail(email: string): void {
    this.customEmails = this.customEmails.filter(e => e !== email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (this.broadcastForm.invalid) {
      this.notification.showError('Veuillez remplir tous les champs requis');
      return;
    }

    if (this.currentRecipientType === RecipientType.CUSTOM && this.customEmails.length === 0) {
      this.notification.showError('Veuillez ajouter au moins un email pour les destinataires personnalisés');
      return;
    }

    if (this.currentRecipientType === RecipientType.SINGLE_MEMBER && (this.singleMemberId == null || this.singleMemberId <= 0)) {
      this.notification.showError('Sélectionnez un membre dans la liste');
      return;
    }

    const formValue = this.broadcastForm.value;
    const payload: Record<string, unknown> = {
      subject: formValue.subject,
      message: formValue.message,
      recipientType: formValue.recipientType,
    };
    if (formValue.recipientType === RecipientType.CUSTOM) {
      payload['customRecipients'] = this.customEmails;
    }
    if (formValue.recipientType === RecipientType.SINGLE_MEMBER) {
      payload['userId'] = this.singleMemberId;
    }

    // Confirmation avant envoi
    const recipientCount = this.getRecipientCountLabel();
    const confirmMessage = `Êtes-vous sûr de vouloir envoyer cet email à ${recipientCount} ?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isSubmitting = true;
    this.lastResult = null;

    this.http.post<{ sent: number; failed: number }>(`${environment.apiUrl}/broadcast/send-email`, payload)
      .subscribe({
        next: (result) => {
          this.lastResult = result;
          this.isSubmitting = false;
          
          if (result.failed === 0) {
            this.notification.showSuccess(`Email envoyé avec succès à ${result.sent} destinataire(s)`);
            this.broadcastForm.reset({
              recipientType: RecipientType.NEWSLETTER_SUBSCRIBERS,
            });
            this.customEmails = [];
            this.customEmailInput = '';
            this.singleMemberId = null;
          } else {
            this.notification.showWarning(
              `Envoi partiel : ${result.sent} envoyé(s), ${result.failed} échec(s)`
            );
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erreur lors de l\'envoi:', error);
          this.notification.showError(
            error.error?.message || 'Erreur lors de l\'envoi de l\'email'
          );
        }
      });
  }

  getRecipientCountLabel(): string {
    switch (this.currentRecipientType) {
      case RecipientType.ALL_ACTIVE:
        return 'tous les membres actifs';
      case RecipientType.NEWSLETTER_SUBSCRIBERS:
        return 'tous les membres abonnés à la newsletter';
      case RecipientType.CUSTOM:
        return `${this.customEmails.length} destinataire(s) personnalisé(s)`;
      case RecipientType.SINGLE_MEMBER:
        return '1 membre sélectionné';
      default:
        return 'les destinataires sélectionnés';
    }
  }
}
