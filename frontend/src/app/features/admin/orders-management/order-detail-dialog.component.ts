import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Order, OrdersService } from '../../../core/services/orders.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-dark">Détails de la commande #{{ data.order.id }}</h2>

      <!-- Order Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-2 text-dark">Informations client</h3>
          <div *ngIf="data.order.user">
            <p class="text-gray-700">{{ data.order.user.firstName }} {{ data.order.user.lastName }}</p>
            <p class="text-sm text-gray-600">{{ data.order.user.email }}</p>
            <p *ngIf="data.order.user.phone" class="text-sm text-gray-600">{{ data.order.user.phone }}</p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-2 text-dark">Statut</h3>
          <div class="mb-3">
            <label class="block text-sm text-gray-600 mb-1">Statut de la commande:</label>
            <select 
              [value]="data.order.status"
              (change)="updateOrderStatus($any($event.target).value)"
              class="w-full px-3 py-2 rounded text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-primary">
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Statut de paiement:</label>
            <select 
              [value]="data.order.paymentStatus"
              (change)="updatePaymentStatus($any($event.target).value)"
              class="w-full px-3 py-2 rounded text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-primary">
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Delivery Info -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6" *ngIf="data.order.deliveryMethod || data.order.shippingAddress">
        <h3 class="font-semibold mb-2 text-dark">Livraison</h3>
        <p *ngIf="data.order.deliveryMethod" class="text-gray-700 mb-1">
          Méthode: {{ data.order.deliveryMethod.name }} - {{ formatPrice(data.order.deliveryMethod.cost) }}
        </p>
        <p *ngIf="data.order.shippingAddress" class="text-gray-700">
          Adresse: {{ data.order.shippingAddress }}
        </p>
      </div>

      <!-- Order Items -->
      <div class="mb-6">
        <h3 class="font-semibold mb-4 text-dark">Articles commandés</h3>
        <div class="space-y-3">
          <div *ngFor="let item of data.order.items" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              *ngIf="item.product.imageUrl" 
              [src]="item.product.imageUrl" 
              [alt]="item.product.name"
              class="w-16 h-16 object-cover rounded">
            <div *ngIf="!item.product.imageUrl" class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <mat-icon class="text-gray-400">image</mat-icon>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-dark">{{ item.product.name }}</p>
              <p class="text-sm text-gray-600">Quantité: {{ item.quantity }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-dark">{{ formatPrice(item.price) }}</p>
              <p class="text-sm text-gray-600">Sous-total: {{ formatPrice(item.subtotal) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-semibold mb-4 text-dark">Résumé</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Sous-total</span>
            <span>{{ formatPrice(data.order.totalAmount - data.order.deliveryCost) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Livraison</span>
            <span>{{ formatPrice(data.order.deliveryCost) }}</span>
          </div>
          <mat-divider></mat-divider>
          <div class="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span class="text-primary">{{ formatPrice(data.order.totalAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div *ngIf="data.order.notes" class="mb-6">
        <h3 class="font-semibold mb-2 text-dark">Notes</h3>
        <p class="text-gray-700 bg-gray-50 rounded-lg p-4">{{ data.order.notes }}</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <button mat-button (click)="close()">Fermer</button>
      </div>
    </div>
  `,
  styles: []
})
export class OrderDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: Order },
    private ordersService: OrdersService,
    private notification: NotificationService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payé',
      failed: 'Échoué',
      refunded: 'Remboursé'
    };
    return labels[status] || status;
  }

  updateOrderStatus(newStatus: string): void {
    this.ordersService.update(this.data.order.id, { status: newStatus as any }).subscribe({
      next: () => {
        this.data.order.status = newStatus as any;
        this.notification.showSuccess('Statut de la commande mis à jour');
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  updatePaymentStatus(newPaymentStatus: string): void {
    this.ordersService.update(this.data.order.id, { paymentStatus: newPaymentStatus as any }).subscribe({
      next: () => {
        this.data.order.paymentStatus = newPaymentStatus as any;
        this.notification.showSuccess('Statut de paiement mis à jour');
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour du statut de paiement');
      }
    });
  }
}

