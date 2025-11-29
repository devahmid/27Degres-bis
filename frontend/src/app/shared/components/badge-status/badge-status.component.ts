import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="statusClass" class="px-3 py-1 rounded-full text-sm font-semibold">
      {{ statusLabel }}
    </span>
  `,
  styles: []
})
export class BadgeStatusComponent {
  @Input() status: 'paid' | 'pending' | 'overdue' = 'pending';

  get statusLabel(): string {
    const labels = {
      paid: '✓ À jour',
      pending: '⚠️ En attente',
      overdue: '❌ En retard'
    };
    return labels[this.status];
  }

  get statusClass(): string {
    return `status-${this.status}`;
  }
}

