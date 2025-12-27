import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Cotisation } from '../../../core/models/cotisation.model';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    BadgeStatusComponent,
    DateFormatPipe
  ],
  templateUrl: './membership.component.html',
  styleUrl: './membership.component.scss'
})
export class MembershipComponent implements OnInit {
  currentYearStatus$!: Observable<Cotisation | null>;
  history$!: Observable<Cotisation[]>;
  currentYear = new Date().getFullYear();

  displayedColumns: string[] = ['year', 'amount', 'status', 'paymentDate', 'receipt'];

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentYearStatus$ = this.http.get<Cotisation | null>(`${environment.apiUrl}/cotisations/current`);
    this.history$ = this.http.get<Cotisation[]>(`${environment.apiUrl}/cotisations/history`);
  }

  payCotisation(): void {
    // TODO: Implement SumUp payment integration
    this.notification.showInfo('Fonctionnalité de paiement à venir');
  }

  downloadReceipt(cotisation: Cotisation): void {
    if (cotisation.receiptUrl) {
      window.open(cotisation.receiptUrl, '_blank');
    }
  }
}









