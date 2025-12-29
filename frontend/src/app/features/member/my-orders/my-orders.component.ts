import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { OrdersService, Order } from '../../../core/services/orders.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderDetailDialogComponent } from '../../admin/orders-management/order-detail-dialog.component';

@Component({
  selector: 'app-my-orders',
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
    MatDialogModule
  ],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = ['id', 'status', 'totalAmount', 'paymentStatus', 'createdAt', 'actions'];
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
    this.ordersService.getAll().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        this.notification.showError('Erreur lors du chargement de vos commandes.');
        console.error(err);
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

  cancelOrder(order: Order): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler la commande #${order.id} ?`)) {
      this.ordersService.cancelOrder(order.id).subscribe({
        next: () => {
          this.notification.showSuccess('Commande annulée avec succès.');
          this.loadOrders();
        },
        error: (err) => {
          this.notification.showError(err.error?.message || 'Erreur lors de l\'annulation de la commande.');
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

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  canCancel(order: Order): boolean {
    return order.status !== 'cancelled' && order.status !== 'delivered';
  }
}

