import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './directory.component.html',
  styleUrl: './directory.component.scss'
})
export class DirectoryComponent implements OnInit {
  members$!: Observable<User[]>;
  filteredMembers$!: Observable<User[]>;
  searchTerm = '';
  filterRole = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.members$ = this.http.get<User[]>(`${environment.apiUrl}/users/directory`);
    this.filteredMembers$ = this.members$;
  }

  onSearchChange(): void {
    this.filteredMembers$ = this.members$.pipe(
      map(members => {
        let filtered = members.filter(m => m.consentAnnuaire);
        
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(m => 
            m.firstName.toLowerCase().includes(term) ||
            m.lastName.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term)
          );
        }
        
        if (this.filterRole) {
          filtered = filtered.filter(m => m.role === this.filterRole);
        }
        
        return filtered;
      })
    );
  }
}

