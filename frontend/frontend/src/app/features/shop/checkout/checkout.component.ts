import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { CartService, CartItem, OrdersService, DeliveryMethod } from '../../../core/services/orders.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDividerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  deliveryMethods: DeliveryMethod[] = [];
  subtotal = 0;
  deliveryCost = 0;
  total = 0;
  currentUser: any;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      deliveryMethodId: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      paymentMethod: ['card', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.cartItems = this.cartService.getCart();
    
    if (this.cartItems.length === 0) {
      this.notification.showError('Votre panier est vide');
      this.router.navigate(['/shop/cart']);
      return;
    }

    this.subtotal = this.cartService.getCartTotal();
    this.calculateTotal();

    this.ordersService.getActiveDeliveryMethods().subscribe({
      next: (methods) => {
        this.deliveryMethods = methods;
        if (methods.length > 0) {
          this.checkoutForm.patchValue({ deliveryMethodId: methods[0].id });
          this.onDeliveryMethodChange();
        }
      },
      error: () => {
        this.notification.showError('Erreur lors du chargement des méthodes de livraison');
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        const address = [
          user.addressStreet,
          user.addressCity,
          user.addressPostalCode
        ].filter(Boolean).join(', ');
        
        if (address) {
          this.checkoutForm.patchValue({ shippingAddress: address });
        }
      }
    });

    this.checkoutForm.get('deliveryMethodId')?.valueChanges.subscribe(() => {
      this.onDeliveryMethodChange();
    });
  }

  onDeliveryMethodChange(): void {
    const methodId = this.checkoutForm.get('deliveryMethodId')?.value;
    const method = this.deliveryMethods.find(m => m.id === methodId);
    
    if (method) {
      this.deliveryCost = method.cost;
    } else {
      this.deliveryCost = 0;
    }
    
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.subtotal + this.deliveryCost;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const orderData = {
        items: this.cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryMethodId: this.checkoutForm.get('deliveryMethodId')?.value,
        shippingAddress: this.checkoutForm.get('shippingAddress')?.value,
        paymentMethod: this.checkoutForm.get('paymentMethod')?.value,
        notes: this.checkoutForm.get('notes')?.value || undefined
      };

      this.ordersService.create(orderData).subscribe({
        next: (order) => {
          this.cartService.clearCart();
          this.notification.showSuccess('Commande passée avec succès !');
          this.router.navigate(['/member/dashboard']);
        },
        error: (error) => {
          console.error(error);
          this.notification.showError('Erreur lors de la création de la commande');
          this.isSubmitting = false;
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
