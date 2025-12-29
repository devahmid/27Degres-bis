import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrdersService, DeliveryMethod } from '../../../core/services/orders.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddDeliveryMethodDialogComponent } from './add-delivery-method-dialog.component';

@Component({
  selector: 'app-delivery-methods-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './delivery-methods-management.component.html',
  styleUrl: './delivery-methods-management.component.scss'
})
export class DeliveryMethodsManagementComponent implements OnInit {
  deliveryMethods: DeliveryMethod[] = [];
  displayedColumns: string[] = ['name', 'description', 'cost', 'estimatedDays', 'isActive', 'actions'];
  loading = true;

  constructor(
    private ordersService: OrdersService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDeliveryMethods();
  }

  loadDeliveryMethods(): void {
    this.loading = true;
    this.ordersService.getAllDeliveryMethods().subscribe({
      next: (methods) => {
        this.deliveryMethods = methods;
        this.loading = false;
      },
      error: () => {
        this.notification.showError('Erreur lors du chargement des méthodes de livraison');
        this.loading = false;
      }
    });
  }

  openAddDialog(method?: DeliveryMethod): void {
    const dialogRef = this.dialog.open(AddDeliveryMethodDialogComponent, {
      width: '600px',
      data: { method }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDeliveryMethods();
      }
    });
  }

  toggleActive(method: DeliveryMethod): void {
    this.ordersService.updateDeliveryMethod(method.id, { isActive: !method.isActive }).subscribe({
      next: () => {
        this.notification.showSuccess('Statut mis à jour');
        this.loadDeliveryMethods();
      },
      error: () => {
        this.notification.showError('Erreur lors de la mise à jour');
      }
    });
  }

  deleteMethod(method: DeliveryMethod): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${method.name}" ?`)) {
      this.ordersService.deleteDeliveryMethod(method.id).subscribe({
        next: () => {
          this.notification.showSuccess('Méthode de livraison supprimée');
          this.loadDeliveryMethods();
        },
        error: () => {
          this.notification.showError('Erreur lors de la suppression');
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
}

