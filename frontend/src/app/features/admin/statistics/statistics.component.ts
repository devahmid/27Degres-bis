import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8 text-dark">Statistiques</h1>
      <mat-card>
        <mat-card-content>
          <p>Statistiques à implémenter.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class StatisticsComponent {}

