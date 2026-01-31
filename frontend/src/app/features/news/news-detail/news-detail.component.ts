import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Post, Comment } from '../../../core/models/post.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { FormatContentPipe } from '../../../shared/pipes/format-content.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    DateFormatPipe,
    FormatContentPipe
  ],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent implements OnInit {
  post$!: Observable<Post>;
  comments$!: Observable<Comment[]>;
  commentForm: FormGroup;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    public authService: AuthService,
    private notification: NotificationService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.post$ = this.http.get<Post>(`${environment.apiUrl}/posts/slug/${slug}`);
      this.loadComments(slug);
    }
  }

  loadComments(slug: string): void {
    this.comments$ = this.http.get<Comment[]>(`${environment.apiUrl}/posts/${slug}/comments`);
  }

  onSubmitComment(slug: string): void {
    if (this.commentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      // Utiliser le slug car l'API accepte les deux (ID ou slug)
      this.http.post(`${environment.apiUrl}/posts/${slug}/comments`, this.commentForm.value)
        .subscribe({
          next: () => {
            this.notification.showSuccess('Commentaire ajouté !');
            this.commentForm.reset();
            this.isSubmitting = false;
            this.loadComments(slug);
          },
          error: () => {
            // L'erreur est déjà gérée par l'intercepteur d'erreur
            this.isSubmitting = false;
          }
        });
    }
  }
}
