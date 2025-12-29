import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService, CartItem } from '../../../core/services/orders.service';
import { ProductsService } from '../../../core/services/products.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private productsService: ProductsService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCart();
    this.calculateTotal();
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
    this.loadCart();
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.notification.showSuccess('Article retiré du panier');
    this.loadCart();
  }

  clearCart(): void {
    if (confirm('Voulez-vous vider le panier ?')) {
      this.cartService.clearCart();
      this.loadCart();
      this.notification.showSuccess('Panier vidé');
    }
  }

  calculateTotal(): void {
    this.total = this.cartService.getCartTotal();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}
