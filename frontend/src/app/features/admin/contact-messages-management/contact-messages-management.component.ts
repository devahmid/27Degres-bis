import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContactService, ContactMessage } from '../../../core/services/contact.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { ContactMessageDetailDialogComponent } from './contact-message-detail-dialog.component';

@Component({
  selector: 'app-contact-messages-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    DateFormatPipe
  ],
  templateUrl: './contact-messages-management.component.html',
  styleUrl: './contact-messages-management.component.scss'
})
export class ContactMessagesManagementComponent implements OnInit {
  messages: ContactMessage[] = [];
  displayedColumns: string[] = ['name', 'email', 'subject', 'createdAt', 'isRead', 'actions'];
  loading = true;
  filterRead: 'all' | 'read' | 'unread' = 'all';

  constructor(
    private contactService: ContactService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.contactService.getAll().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loading = false;
      },
      error: () => {
        this.notification.showError('Erreur lors du chargement des messages');
        this.loading = false;
      }
    });
  }

  getFilteredMessages(): ContactMessage[] {
    if (this.filterRead === 'all') {
      return this.messages;
    }
    return this.messages.filter(msg => 
      this.filterRead === 'read' ? msg.isRead : !msg.isRead
    );
  }

  get unreadCount(): number {
    return this.messages.filter(m => !m.isRead).length;
  }

  get filteredMessagesCount(): number {
    return this.getFilteredMessages().length;
  }

  viewMessage(message: ContactMessage): void {
    const dialogRef = this.dialog.open(ContactMessageDetailDialogComponent, {
      width: '800px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'replied' || result === 'read') {
        this.loadMessages();
      }
    });
  }

  markAsRead(message: ContactMessage): void {
    this.contactService.markAsRead(message.id).subscribe({
      next: () => {
        this.notification.showSuccess('Message marqué comme lu');
        this.loadMessages();
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  deleteMessage(message: ContactMessage): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le message de ${message.name} ?`)) {
      this.contactService.delete(message.id).subscribe({
        next: () => {
          this.notification.showSuccess('Message supprimé');
          this.loadMessages();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression');
        }
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

