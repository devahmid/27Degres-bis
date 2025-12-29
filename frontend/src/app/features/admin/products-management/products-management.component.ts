import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductsService, Product } from '../../../core/services/products.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddProductDialogComponent } from './add-product-dialog.component';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './products-management.component.html',
  styleUrl: './products-management.component.scss'
})
export class ProductsManagementComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'stock', 'status', 'featured', 'actions'];

  constructor(
    private productsService: ProductsService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getAllAdmin().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        this.notification.showError('Erreur lors du chargement des produits');
        console.error(error);
      }
    });
  }

  openAddDialog(product?: Product): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '600px',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.notification.showSuccess('Produit supprimé avec succès');
          this.loadProducts();
        },
        error: (error) => {
          this.notification.showError('Erreur lors de la suppression du produit');
          console.error(error);
        }
      });
    }
  }

  toggleStatus(product: Product): void {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    this.productsService.update(product.id, { status: newStatus }).subscribe({
      next: () => {
        this.notification.showSuccess(`Produit ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);
        this.loadProducts();
      },
      error: (error) => {
        this.notification.showError('Erreur lors de la mise à jour du statut');
        console.error(error);
      }
    });
  }

  toggleFeatured(product: Product): void {
    this.productsService.update(product.id, { isFeatured: !product.isFeatured }).subscribe({
      next: () => {
        this.notification.showSuccess(`Produit ${!product.isFeatured ? 'mis en avant' : 'retiré de la mise en avant'}`);
        this.loadProducts();
      },
      error: (error) => {
        this.notification.showError('Erreur lors de la mise à jour');
        console.error(error);
      }
    });
  }

  updateStock(product: Product, newQuantity: number): void {
    if (newQuantity < 0) {
      this.notification.showError('La quantité ne peut pas être négative');
      return;
    }

    this.productsService.updateStock(product.id, newQuantity).subscribe({
      next: () => {
        this.notification.showSuccess('Stock mis à jour avec succès');
        this.loadProducts();
      },
      error: (error) => {
        this.notification.showError('Erreur lors de la mise à jour du stock');
        console.error(error);
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}

