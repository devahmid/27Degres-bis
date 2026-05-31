import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { EventsService, Event } from '../../../core/services/events.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

interface RatingField {
  key: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-event-feedback',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    DateFormatPipe,
  ],
  templateUrl: './event-feedback.component.html',
  styleUrl: './event-feedback.component.scss',
})
export class EventFeedbackComponent implements OnInit {
  event: Event | null = null;
  feedbackForm!: FormGroup;
  isSubmitting = false;
  alreadySubmitted = false;
  submittedSuccessfully = false;
  loading = true;

  ratingFields: RatingField[] = [
    {
      key: 'overallRating',
      label: 'Satisfaction globale',
      description: 'Votre ressenti général sur l\'événement',
    },
    {
      key: 'organizationRating',
      label: 'Organisation & logistique',
      description: 'Programme, horaires, repas, hébergement…',
    },
    {
      key: 'atmosphereRating',
      label: 'Ambiance & convivialité',
      description: 'Qualité des échanges et du moment partagé',
    },
    {
      key: 'communityImpactRating',
      label: 'Lien communautaire',
      description: 'Renforcement des relations entre les membres',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private eventsService: EventsService,
    private fb: FormBuilder,
    private notification: NotificationService,
  ) {
    this.feedbackForm = this.fb.group({
      overallRating: [null, Validators.required],
      organizationRating: [null, Validators.required],
      atmosphereRating: [null, Validators.required],
      communityImpactRating: [null, Validators.required],
      highlights: [''],
      improvements: ['', [Validators.required, Validators.minLength(10)]],
      wouldRecommend: [true, Validators.required],
      additionalComments: [''],
    });
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.router.navigate(['/events']);
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/events/${eventId}/feedback` },
      });
      return;
    }

    this.loadEvent(+eventId);
  }

  loadEvent(eventId: number): void {
    this.eventsService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;

        if (!event.feedbackOpen) {
          return;
        }

        this.eventsService.getMyFeedback(eventId).subscribe({
          next: (response) => {
            if (response.submitted) {
              this.alreadySubmitted = true;
            }
          },
        });
      },
      error: () => {
        this.notification.showError('Événement introuvable');
        this.router.navigate(['/events']);
      },
    });
  }

  setRating(field: string, value: number): void {
    this.feedbackForm.get(field)?.setValue(value);
    this.feedbackForm.get(field)?.markAsTouched();
  }

  getRating(field: string): number | null {
    return this.feedbackForm.get(field)?.value;
  }

  onSubmit(): void {
    if (!this.event || this.feedbackForm.invalid || this.isSubmitting) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.eventsService.submitFeedback(this.event.id, this.feedbackForm.value).subscribe({
      next: () => {
        this.submittedSuccessfully = true;
        this.isSubmitting = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Erreur lors de l\'envoi du questionnaire';
        this.notification.showError(message);
        this.isSubmitting = false;
      },
    });
  }
}
