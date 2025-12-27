import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostsService, Post } from '../../../core/services/posts.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    DateFormatPipe,
    TruncatePipe
  ],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss'
})
export class NewsListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  featuredPost$!: Observable<Post | null>;
  filteredPosts$!: Observable<Post[]>;
  searchTerm = '';
  filterCategory = '';

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.posts$ = this.postsService.getPosts();
    this.featuredPost$ = this.posts$.pipe(
      map(posts => posts.length > 0 ? posts[0] : null)
    );
    this.filteredPosts$ = this.posts$;
  }

  onSearchChange(): void {
    this.filteredPosts$ = this.posts$.pipe(
      map(posts => {
        let filtered = [...posts];
        
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.excerpt?.toLowerCase().includes(term)
          );
        }

        if (this.filterCategory) {
          filtered = filtered.filter(p => p.category === this.filterCategory);
        }

        return filtered;
      })
    );
  }
}

