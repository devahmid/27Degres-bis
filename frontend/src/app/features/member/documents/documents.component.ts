import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentsService, Document } from '../../../core/services/documents.service';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    DateFormatPipe
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit {
  allDocuments$!: Observable<Document[]>;
  myDocuments$!: Observable<Document[]>;
  displayedColumns: string[] = ['title', 'category', 'createdAt', 'download'];
  showOnlyMine = false;

  constructor(
    private documentsService: DocumentsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Charger les documents accessibles (généraux + assignés à l'utilisateur)
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        // Documents généraux (sans assignedToUserId) + assignés à l'utilisateur
        // L'API backend filtre automatiquement via findAllForUser
        this.allDocuments$ = this.documentsService.getDocuments();
        
        // Documents uniquement assignés à l'utilisateur (pour le mode "Mes documents")
        this.myDocuments$ = this.documentsService.getDocuments(user.id);
      } else {
        // Si pas d'utilisateur connecté, ne pas charger (l'API nécessite l'authentification)
        this.allDocuments$ = this.documentsService.getDocuments();
      }
    });
  }

  downloadDocument(document: Document): void {
    this.documentsService.downloadDocument(document.id);
  }

  toggleView(): void {
    this.showOnlyMine = !this.showOnlyMine;
  }

  get documentsToShow$(): Observable<Document[]> {
    return this.showOnlyMine ? (this.myDocuments$ || this.allDocuments$) : this.allDocuments$;
  }
}
