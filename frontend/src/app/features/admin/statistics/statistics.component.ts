import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { OrdersService } from '../../../core/services/orders.service';

interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

interface CotisationStatistics {
  total: number;
  currentYear: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
}

interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProductsSold: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

interface CombinedStatistics {
  users: UserStatistics;
  cotisations: CotisationStatistics;
  orders: OrderStatistics;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-4xl font-bold mb-2 text-dark">Statistiques Détaillées</h1>
          <p class="text-gray-600">Analyse complète de l'activité de l'association</p>
        </div>
        <div class="mt-4 md:mt-0">
          <label class="block text-dark font-medium mb-2">Année</label>
          <select 
            [(ngModel)]="selectedYear" 
            (ngModelChange)="onYearChange()"
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
            <option value="">Toutes</option>
            <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-12">
        <mat-icon class="text-6xl text-gray-400 animate-spin">refresh</mat-icon>
        <p class="mt-4 text-gray-600">Chargement des statistiques...</p>
      </div>

      <!-- Statistics Content -->
      <ng-container *ngIf="!loading">
        <div *ngIf="stats$ | async as stats">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Members -->
          <mat-card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm mb-1">Total Membres</p>
                  <p class="text-4xl font-bold">{{ stats.users.total }}</p>
                  <p class="text-blue-100 text-xs mt-2">{{ stats.users.active }} actifs</p>
                </div>
                <mat-icon class="text-6xl opacity-50">people</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Cotisations Current Year -->
          <mat-card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-purple-100 text-sm mb-1">Cotisations {{ selectedYear || 'Toutes' }}</p>
                  <p class="text-4xl font-bold">{{ stats.cotisations.currentYear }}</p>
                  <p class="text-purple-100 text-xs mt-2">{{ stats.cotisations.paid }} payées</p>
                </div>
                <mat-icon class="text-6xl opacity-50">credit_card</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Total Revenue -->
          <mat-card class="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-100 text-sm mb-1">Revenus Totaux</p>
                  <p class="text-3xl font-bold">{{ stats.orders.totalRevenue | number:'1.2-2' }} €</p>
                  <p class="text-green-100 text-xs mt-2">{{ stats.orders.totalOrders }} commandes</p>
                </div>
                <mat-icon class="text-6xl opacity-50">euro</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Products Sold -->
          <mat-card class="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-orange-100 text-sm mb-1">Produits Vendus</p>
                  <p class="text-4xl font-bold">{{ stats.orders.totalProductsSold }}</p>
                  <p class="text-orange-100 text-xs mt-2">{{ stats.orders.pendingOrders }} en attente</p>
                </div>
                <mat-icon class="text-6xl opacity-50">shopping_cart</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Detailed Statistics Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Users by Role -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="mr-2">people</mat-icon>
                Répartition par Rôle
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-4">
                <div *ngFor="let role of getRoles()" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <mat-icon class="mr-3 text-primary">{{ getRoleIcon(role) }}</mat-icon>
                    <span class="font-medium capitalize">{{ role }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-2xl font-bold text-primary mr-3">{{ stats.users.byRole[role] || 0 }}</span>
                    <span class="text-sm text-gray-500">
                      ({{ getPercentage(stats.users.byRole[role] || 0, stats.users.total) }}%)
                    </span>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Membres actifs:</span>
                    <span class="font-bold text-green-600">{{ stats.users.active }}</span>
                  </div>
                  <div class="flex justify-between text-sm mt-2">
                    <span class="text-gray-600">Membres inactifs:</span>
                    <span class="font-bold text-gray-600">{{ stats.users.inactive }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Cotisations Status -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="mr-2">credit_card</mat-icon>
                Statut des Cotisations {{ selectedYear || 'Toutes' }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <mat-icon class="text-green-600 mr-3">check_circle</mat-icon>
                    <span class="font-medium text-gray-700">Payées</span>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-green-600">{{ stats.cotisations.paid }}</p>
                    <p class="text-sm text-gray-500">{{ stats.cotisations.paidAmount | number:'1.2-2' }} €</p>
                  </div>
                </div>
                <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div class="flex items-center">
                    <mat-icon class="text-yellow-600 mr-3">schedule</mat-icon>
                    <span class="font-medium text-gray-700">En attente</span>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-yellow-600">{{ stats.cotisations.pending }}</p>
                    <p class="text-sm text-gray-500">
                      {{ getPercentage(stats.cotisations.pending, stats.cotisations.currentYear) }}%
                    </p>
                  </div>
                </div>
                <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div class="flex items-center">
                    <mat-icon class="text-red-600 mr-3">warning</mat-icon>
                    <span class="font-medium text-gray-700">En retard</span>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-red-600">{{ stats.cotisations.overdue }}</p>
                    <p class="text-sm text-gray-500">
                      {{ getPercentage(stats.cotisations.overdue, stats.cotisations.currentYear) }}%
                    </p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t">
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Montant total attendu:</span>
                    <span class="font-bold">{{ stats.cotisations.totalAmount | number:'1.2-2' }} €</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Montant collecté:</span>
                    <span class="font-bold text-green-600">{{ stats.cotisations.paidAmount | number:'1.2-2' }} €</span>
                  </div>
                  <div class="mt-2">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        class="bg-green-600 h-3 rounded-full transition-all duration-500"
                        [style.width.%]="getPercentage(stats.cotisations.paidAmount, stats.cotisations.totalAmount)">
                      </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      Taux de collecte: {{ getPercentage(stats.cotisations.paidAmount, stats.cotisations.totalAmount) }}%
                    </p>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Orders Statistics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Orders by Status -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="mr-2">shopping_cart</mat-icon>
                Commandes par Statut
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-3">
                <div *ngFor="let status of getOrderStatuses()" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <mat-icon class="mr-2" [class]="getStatusColorClass(status)">{{ getStatusIcon(status) }}</mat-icon>
                    <span class="font-medium capitalize">{{ getStatusLabel(status) }}</span>
                  </div>
                  <span class="text-xl font-bold">{{ stats.orders.ordersByStatus[status] || 0 }}</span>
                </div>
                <div class="mt-4 pt-4 border-t">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Total commandes:</span>
                    <span class="font-bold">{{ stats.orders.totalOrders }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Revenue by Month -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="mr-2">trending_up</mat-icon>
                Revenus par Mois (6 derniers mois)
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-3">
                <div *ngFor="let month of stats.orders.revenueByMonth" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span class="font-medium capitalize">{{ month.month }}</span>
                  <div class="flex items-center">
                    <span class="text-xl font-bold text-green-600 mr-3">{{ month.revenue | number:'1.2-2' }} €</span>
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-green-600 h-2 rounded-full"
                        [style.width.%]="getPercentage(month.revenue, getMaxRevenue(stats.orders.revenueByMonth))">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Moyenne mensuelle:</span>
                    <span class="font-bold">
                      {{ getAverageRevenue(stats.orders.revenueByMonth) | number:'1.2-2' }} €
                    </span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Summary Card -->
        <mat-card class="bg-gradient-to-r from-primary to-secondary text-white">
          <mat-card-content class="p-8">
            <h2 class="text-2xl font-bold mb-6">Résumé Global</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-opacity-80 text-sm mb-2">Taux d'adhésion</p>
                <p class="text-3xl font-bold">
                  {{ getPercentage(stats.users.active, stats.users.total) }}%
                </p>
                <p class="text-sm text-opacity-80 mt-1">{{ stats.users.active }} / {{ stats.users.total }} membres</p>
              </div>
              <div>
                <p class="text-opacity-80 text-sm mb-2">Taux de collecte cotisations</p>
                <p class="text-3xl font-bold">
                  {{ getPercentage(stats.cotisations.paidAmount, stats.cotisations.totalAmount) }}%
                </p>
                <p class="text-sm text-opacity-80 mt-1">
                  {{ stats.cotisations.paidAmount | number:'1.2-2' }} € / {{ stats.cotisations.totalAmount | number:'1.2-2' }} €
                </p>
              </div>
              <div>
                <p class="text-opacity-80 text-sm mb-2">Panier moyen</p>
                <p class="text-3xl font-bold">
                  {{ getAverageOrderValue(stats.orders.totalRevenue, stats.orders.totalOrders) | number:'1.2-2' }} €
                </p>
                <p class="text-sm text-opacity-80 mt-1">{{ stats.orders.totalOrders }} commandes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  stats$!: Observable<CombinedStatistics>;
  loading = true;
  selectedYear: number | '' = '';
  currentYear = new Date().getFullYear();
  availableYears: number[] = [];

  constructor(
    private http: HttpClient,
    private ordersService: OrdersService
  ) {
    // Générer les années disponibles (année actuelle + 4 années précédentes)
    for (let i = 0; i < 5; i++) {
      this.availableYears.push(this.currentYear - i);
    }
    this.selectedYear = this.currentYear;
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    
    const usersStats$ = this.http.get<UserStatistics>(`${environment.apiUrl}/users/admin/statistics`);
    
    // Si une année est sélectionnée, filtrer les cotisations par année
    // Sinon, utiliser l'année en cours par défaut
    const year = (typeof this.selectedYear === 'number' && this.selectedYear > 0) 
      ? this.selectedYear 
      : this.currentYear;
    const cotisationsUrl = `${environment.apiUrl}/cotisations/admin/statistics?year=${year}`;
    const cotisationsStats$ = this.http.get<CotisationStatistics>(cotisationsUrl);
    
    const ordersStats$ = this.ordersService.getStatistics();

    this.stats$ = combineLatest([usersStats$, cotisationsStats$, ordersStats$]).pipe(
      map(([users, cotisations, orders]) => {
        this.loading = false;
        return { users, cotisations, orders };
      })
    );
    
    // S'abonner pour déclencher la requête
    this.stats$.subscribe({
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading = false;
      }
    });
  }

  onYearChange(): void {
    this.loadStatistics();
  }

  getRoles(): string[] {
    return ['admin', 'bureau', 'membre', 'visiteur'];
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'admin': 'admin_panel_settings',
      'bureau': 'group',
      'membre': 'person',
      'visiteur': 'visibility'
    };
    return icons[role] || 'person';
  }

  getOrderStatuses(): string[] {
    return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'processing': 'En traitement',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'schedule',
      'processing': 'autorenew',
      'shipped': 'local_shipping',
      'delivered': 'check_circle',
      'cancelled': 'cancel'
    };
    return icons[status] || 'help';
  }

  getStatusColorClass(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'text-yellow-600',
      'processing': 'text-blue-600',
      'shipped': 'text-purple-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getMaxRevenue(revenueByMonth: Array<{ month: string; revenue: number }>): number {
    if (!revenueByMonth || revenueByMonth.length === 0) return 1;
    return Math.max(...revenueByMonth.map(m => m.revenue), 1);
  }

  getAverageRevenue(revenueByMonth: Array<{ month: string; revenue: number }>): number {
    if (!revenueByMonth || revenueByMonth.length === 0) return 0;
    const total = revenueByMonth.reduce((sum, m) => sum + m.revenue, 0);
    return total / revenueByMonth.length;
  }

  getAverageOrderValue(totalRevenue: number, totalOrders: number): number {
    if (totalOrders === 0) return 0;
    return totalRevenue / totalOrders;
  }
}
