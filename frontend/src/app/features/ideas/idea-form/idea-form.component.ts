import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IdeasService } from '../../../core/services/ideas.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Idea } from '../../../core/models/idea.model';

@Component({
  selector: 'app-idea-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './idea-form.component.html',
  styleUrl: './idea-form.component.scss'
})
export class IdeaFormComponent implements OnInit {
  ideaForm: FormGroup;
  isEditMode = false;
  ideaId: number | null = null;
  loading = false;
  submitting = false;

  categories = [
    { value: 'activity', label: 'Activité' },
    { value: 'project', label: 'Projet' },
    { value: 'improvement', label: 'Amélioration' },
    { value: 'event', label: 'Événement' }
  ];

  constructor(
    private fb: FormBuilder,
    private ideasService: IdeasService,
    private authService: AuthService,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.ideaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['activity', Validators.required],
      estimatedBudget: [null, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.ideaId = +id;
      this.loadIdea(this.ideaId);
    }
  }

  loadIdea(id: number): void {
    this.loading = true;
    this.ideasService.getIdea(id).subscribe({
      next: (idea) => {
        // Vérifier que l'utilisateur peut éditer
        const user = this.authService.getCurrentUser();
        if (!user || (user.id !== idea.authorId && user.role !== 'admin' && user.role !== 'bureau')) {
          this.notification.showError('Vous n\'êtes pas autorisé à modifier cette idée');
          this.router.navigate(['/ideas', id]);
          return;
        }

        this.ideaForm.patchValue({
          title: idea.title,
          description: idea.description,
          category: idea.category,
          estimatedBudget: idea.estimatedBudget || null
        });
        this.loading = false;
      },
      error: (error) => {
        this.notification.showError('Erreur lors du chargement de l\'idée');
        this.router.navigate(['/ideas']);
      }
    });
  }

  onSubmit(): void {
    if (this.ideaForm.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    const formValue = this.ideaForm.value;

    if (this.isEditMode && this.ideaId) {
      // Mise à jour
      this.ideasService.updateIdea(this.ideaId, formValue).subscribe({
        next: () => {
          this.notification.showSuccess('Idée mise à jour avec succès');
          this.router.navigate(['/ideas', this.ideaId]);
        },
        error: (error) => {
          this.notification.showError('Erreur lors de la mise à jour');
          this.submitting = false;
        }
      });
    } else {
      // Création
      this.ideasService.createIdea(formValue).subscribe({
        next: (idea) => {
          this.notification.showSuccess('Idée créée avec succès !');
          this.router.navigate(['/ideas', idea.id]);
        },
        error: (error) => {
          this.notification.showError('Erreur lors de la création');
          this.submitting = false;
        }
      });
    }
  }
}
