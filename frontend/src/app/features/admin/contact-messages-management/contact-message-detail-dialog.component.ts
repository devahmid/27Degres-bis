import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ContactService, ContactMessage } from '../../../core/services/contact.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-contact-message-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-dark">Message de contact</h2>

      <!-- Message Info -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold mb-2 text-dark">Expéditeur</h3>
            <p class="text-gray-700">{{ data.message.name }}</p>
            <a [href]="'mailto:' + data.message.email" class="text-primary hover:underline">
              {{ data.message.email }}
            </a>
          </div>
          <div>
            <h3 class="font-semibold mb-2 text-dark">Date</h3>
            <p class="text-gray-700">{{ formatDate(data.message.createdAt) }}</p>
            <mat-chip [class]="data.message.isRead ? 'bg-green-100 text-green-800 mt-2' : 'bg-yellow-100 text-yellow-800 mt-2'">
              {{ data.message.isRead ? 'Lu' : 'Non lu' }}
            </mat-chip>
          </div>
        </div>
        <div *ngIf="data.message.subject" class="mt-4">
          <h3 class="font-semibold mb-2 text-dark">Sujet</h3>
          <p class="text-gray-700">{{ data.message.subject }}</p>
        </div>
      </div>

      <!-- Message Content -->
      <div class="mb-6">
        <h3 class="font-semibold mb-2 text-dark">Message</h3>
        <div class="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
          {{ data.message.message }}
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Reply Form -->
      <div class="mt-6">
        <h3 class="text-xl font-semibold mb-4 text-dark">Répondre</h3>
        <form [formGroup]="replyForm" (ngSubmit)="onReply()" class="space-y-4">
          <div>
            <label class="block text-dark font-medium mb-2">Message de réponse *</label>
            <textarea 
              formControlName="message" 
              rows="6"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Votre réponse..."></textarea>
            <div *ngIf="replyForm.get('message')?.hasError('required') && replyForm.get('message')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Le message est requis
            </div>
          </div>

          <div>
            <label class="block text-dark font-medium mb-2">Nom de l'expéditeur (optionnel)</label>
            <input 
              type="text" 
              formControlName="fromName" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Association 27 Degrés">
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button 
              type="button"
              mat-button
              (click)="onMarkAsRead()"
              [disabled]="data.message.isRead"
              class="px-6 py-2">
              <mat-icon class="mr-2">mark_email_read</mat-icon>
              Marquer comme lu
            </button>
            <button 
              type="submit"
              mat-raised-button 
              color="primary"
              [disabled]="!replyForm.valid || isSubmitting"
              class="px-6 py-2">
              <mat-icon *ngIf="!isSubmitting" class="mr-2">send</mat-icon>
              <mat-icon *ngIf="isSubmitting" class="animate-spin mr-2">refresh</mat-icon>
              <span>{{ isSubmitting ? 'Envoi...' : 'Envoyer la réponse' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4 mt-6 pt-4 border-t">
        <button mat-button (click)="close()">Fermer</button>
      </div>
    </div>
  `,
  styles: []
})
export class ContactMessageDetailDialogComponent {
  replyForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<ContactMessageDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: ContactMessage },
    private contactService: ContactService,
    private notification: NotificationService,
    private fb: FormBuilder
  ) {
    this.replyForm = this.fb.group({
      message: ['', Validators.required],
      fromName: ['Association 27 Degrés']
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onMarkAsRead(): void {
    this.contactService.markAsRead(this.data.message.id).subscribe({
      next: () => {
        this.notification.showSuccess('Message marqué comme lu');
        this.data.message.isRead = true;
        this.dialogRef.close('read');
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  onReply(): void {
    if (this.replyForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.contactService.reply(
        this.data.message.id,
        this.replyForm.value.message,
        this.replyForm.value.fromName
      ).subscribe({
        next: () => {
          this.notification.showSuccess('Réponse envoyée avec succès');
          this.replyForm.reset();
          this.replyForm.patchValue({ fromName: 'Association 27 Degrés' });
          this.isSubmitting = false;
          this.dialogRef.close('replied');
        },
        error: () => {
          this.notification.showError('Erreur lors de l\'envoi de la réponse');
          this.isSubmitting = false;
        }
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

