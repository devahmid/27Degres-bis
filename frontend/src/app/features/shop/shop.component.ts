import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ProductsService, Product } from '../../core/services/products.service';
import { CartService } from '../../core/services/orders.service';
import { Observable } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  products$!: Observable<Product[]>;
  featuredProducts$!: Observable<Product[]>;
  selectedCategory: string | null = null;
  categories: string[] = [];

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadFeaturedProducts();
  }

  loadProducts(): void {
    this.products$ = this.productsService.getAll();
    this.products$.subscribe(products => {
      // Extraire les catégories uniques
      this.categories = [...new Set(products.map(p => p.category).filter(c => c))] as string[];
    });
  }

  loadFeaturedProducts(): void {
    this.featuredProducts$ = this.productsService.getFeatured();
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
  }

  getFilteredProducts(products: Product[]): Product[] {
    if (!this.selectedCategory) {
      return products;
    }
    return products.filter(p => p.category === this.selectedCategory);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  addToCart(product: Product): void {
    if (product.stockQuantity > 0) {
      this.cartService.addToCart(product, 1);
      this.notification.showSuccess(`${product.name} ajouté au panier`);
    }
  }
}

