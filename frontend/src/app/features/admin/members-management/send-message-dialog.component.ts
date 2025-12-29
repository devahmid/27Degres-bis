import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-send-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 class="text-2xl font-bold mb-6 text-dark">Envoyer un message</h2>
    
    <form [formGroup]="messageForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <div>
        <label class="block text-dark font-medium mb-2">Destinataire</label>
        <p class="text-gray-700">{{ data.member.firstName }} {{ data.member.lastName }} ({{ data.member.email }})</p>
      </div>

      <div>
        <label class="block text-dark font-medium mb-2">Sujet *</label>
        <input 
          type="text" 
          formControlName="subject" 
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          placeholder="Sujet du message">
        <div *ngIf="messageForm.get('subject')?.hasError('required') && messageForm.get('subject')?.touched" 
             class="text-red-500 text-sm mt-1">
          Le sujet est requis
        </div>
      </div>

      <div>
        <label class="block text-dark font-medium mb-2">Message *</label>
        <textarea 
          formControlName="message" 
          rows="6"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          placeholder="Votre message..."></textarea>
        <div *ngIf="messageForm.get('message')?.hasError('required') && messageForm.get('message')?.touched" 
             class="text-red-500 text-sm mt-1">
          Le message est requis
        </div>
      </div>

      <div class="flex justify-end space-x-4 pt-4">
        <button 
          type="button"
          (click)="onCancel()"
          class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button 
          type="submit"
          [disabled]="!messageForm.valid"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <mat-icon>send</mat-icon>
          <span class="ml-2">Envoyer</span>
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class SendMessageDialogComponent {
  messageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: User },
    private notification: NotificationService
  ) {
    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.messageForm.valid) {
      // Pour l'instant, on simule l'envoi d'un email
      // Dans une vraie application, vous appelleriez un service d'email
      const emailData = {
        to: this.data.member.email,
        subject: this.messageForm.value.subject,
        message: this.messageForm.value.message
      };

      // TODO: Implémenter l'appel API pour envoyer l'email
      console.log('Email à envoyer:', emailData);
      
      this.notification.showSuccess(`Message envoyé à ${this.data.member.firstName} ${this.data.member.lastName}`);
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

