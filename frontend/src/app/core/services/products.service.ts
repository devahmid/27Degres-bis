import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  filePath?: string;
  stockQuantity: number;
  status: 'active' | 'inactive' | 'sold_out';
  category?: string;
  isFeatured: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getAllAdmin(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin`);
  }

  create(product: Partial<Product>, image?: File): Observable<Product> {
    const formData = new FormData();
    
    Object.keys(product).forEach(key => {
      if (product[key as keyof Product] !== undefined && product[key as keyof Product] !== null) {
        formData.append(key, String(product[key as keyof Product]));
      }
    });

    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Product>(this.apiUrl, formData);
  }

  update(id: number, product: Partial<Product>, image?: File): Observable<Product> {
    const formData = new FormData();
    
    Object.keys(product).forEach(key => {
      if (product[key as keyof Product] !== undefined && product[key as keyof Product] !== null) {
        formData.append(key, String(product[key as keyof Product]));
      }
    });

    if (image) {
      formData.append('image', image);
    }

    return this.http.patch<Product>(`${this.apiUrl}/${id}`, formData);
  }

  updateStock(id: number, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/stock`, { quantity });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

