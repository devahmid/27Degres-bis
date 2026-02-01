import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Expense, ExpenseCategory, YearlySummary } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private apiUrl = `${environment.apiUrl}/accounting`;

  constructor(private http: HttpClient) {}

  createExpense(expense: Partial<Expense>, receiptFile?: File): Observable<Expense> {
    const formData = new FormData();
    
    // Ajouter tous les champs de l'expense au FormData
    Object.keys(expense).forEach(key => {
      const value = expense[key as keyof Expense];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Ajouter le fichier justificatif si présent
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }
    
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, formData);
  }

  getExpenses(year?: number, category?: ExpenseCategory): Observable<Expense[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses`, { params });
  }

  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/expenses/${id}`);
  }

  updateExpense(id: number, expense: Partial<Expense>, receiptFile?: File): Observable<Expense> {
    const formData = new FormData();
    
    // Ajouter tous les champs de l'expense au FormData
    Object.keys(expense).forEach(key => {
      const value = expense[key as keyof Expense];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Ajouter le fichier justificatif si présent
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }
    
    return this.http.patch<Expense>(`${this.apiUrl}/expenses/${id}`, formData);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }

  getYearlySummary(year: number): Observable<YearlySummary> {
    return this.http.get<YearlySummary>(`${this.apiUrl}/summary/${year}`);
  }

  getCategoryLabels(): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(`${this.apiUrl}/category-labels`);
  }

  compareYears(year1: number, year2: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/compare/${year1}/${year2}`);
  }

  exportExcel(year?: number): Observable<Blob> {
    const url = year 
      ? `${this.apiUrl}/export/excel?year=${year}`
      : `${this.apiUrl}/export/excel`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      tap((blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `depenses_${year || 'toutes'}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      })
    );
  }

  exportPdf(year: number): Observable<Blob> {
    const url = `${this.apiUrl}/export/pdf/${year}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      tap((blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `rapport_comptable_${year}.pdf`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      })
    );
  }
}
