import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    price: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface DeliveryMethod {
  id: number;
  name: string;
  description?: string;
  cost: number;
  isActive: boolean;
  estimatedDays?: number;
}

export interface Order {
  id: number;
  userId: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryMethodId?: number;
  deliveryMethod?: DeliveryMethod;
  deliveryCost: number;
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDto {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  deliveryMethodId?: number;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CartItem {
  productId: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    price: number;
    stockQuantity: number;
  };
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private deliveryMethodsUrl = `${environment.apiUrl}/delivery-methods`;

  constructor(private http: HttpClient) {}

  create(order: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/cancel`);
  }

  getAllAdmin(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin`);
  }

  getStatistics(): Observable<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    totalProductsSold: number;
    ordersByStatus: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  update(id: number, update: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, update);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/cancel`);
  }

  // Delivery Methods
  getActiveDeliveryMethods(): Observable<DeliveryMethod[]> {
    return this.http.get<DeliveryMethod[]>(`${this.deliveryMethodsUrl}/active`);
  }

  getAllDeliveryMethods(): Observable<DeliveryMethod[]> {
    return this.http.get<DeliveryMethod[]>(this.deliveryMethodsUrl);
  }

  createDeliveryMethod(method: Partial<DeliveryMethod>): Observable<DeliveryMethod> {
    return this.http.post<DeliveryMethod>(this.deliveryMethodsUrl, method);
  }

  updateDeliveryMethod(id: number, method: Partial<DeliveryMethod>): Observable<DeliveryMethod> {
    return this.http.patch<DeliveryMethod>(`${this.deliveryMethodsUrl}/${id}`, method);
  }

  deleteDeliveryMethod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.deliveryMethodsUrl}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'shopping_cart';
  private cartUpdated$ = new Subject<void>();

  get cartUpdated(): Observable<void> {
    return this.cartUpdated$.asObservable();
  }

  getCart(): CartItem[] {
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  addToCart(product: any, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          stockQuantity: product.stockQuantity
        },
        quantity
      });
    }

    this.saveCart(cart);
    this.cartUpdated$.next();
  }

  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(item => item.productId === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(cart);
        this.cartUpdated$.next();
      }
    }
  }

  removeFromCart(productId: number): void {
    const cart = this.getCart().filter(item => item.productId !== productId);
    this.saveCart(cart);
    this.cartUpdated$.next();
  }

  clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
    this.cartUpdated$.next();
  }

  getCartTotal(): number {
    return this.getCart().reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getCartItemCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }
}

