import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { OrdersService, Order } from '../../../core/services/orders.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderDetailDialogComponent } from './order-detail-dialog.component';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.scss'
})
export class OrdersManagementComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = ['id', 'user', 'status', 'totalAmount', 'paymentStatus', 'createdAt', 'actions'];
  loading = true;
  statusFilter: string = 'all';

  constructor(
    private ordersService: OrdersService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getAllAdmin().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.notification.showError('Erreur lors du chargement des commandes');
        this.loading = false;
      }
    });
  }

  getFilteredOrders(): Order[] {
    if (this.statusFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.statusFilter);
  }

  viewOrder(order: Order): void {
    this.dialog.open(OrderDetailDialogComponent, {
      width: '800px',
      data: { order }
    });
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    this.ordersService.update(order.id, { status: newStatus as any }).subscribe({
      next: () => {
        this.notification.showSuccess('Statut de la commande mis à jour');
        this.loadOrders();
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  updatePaymentStatus(order: Order, newPaymentStatus: string): void {
    this.ordersService.update(order.id, { paymentStatus: newPaymentStatus as any }).subscribe({
      next: () => {
        this.notification.showSuccess('Statut de paiement mis à jour');
        this.loadOrders();
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour du statut de paiement');
      }
    });
  }

  deleteOrder(order: Order): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande #${order.id} ?\n\nCette action est irréversible.`)) {
      this.ordersService.deleteOrder(order.id).subscribe({
        next: () => {
          this.notification.showSuccess('Commande supprimée avec succès');
          this.loadOrders();
        },
        error: (err) => {
          this.notification.showError(err.error?.message || 'Erreur lors de la suppression de la commande');
          console.error(err);
        }
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
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

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  canDelete(order: Order): boolean {
    // Ne peut supprimer que si :
    // - La commande n'est pas livrée
    // - La commande n'est pas payée (sauf si annulée)
    return order.status !== 'delivered' && 
           (order.paymentStatus !== 'paid' || order.status === 'cancelled');
  }
}

