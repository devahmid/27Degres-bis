import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventsService, Event } from '../../../core/services/events.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

interface FeedbackStats {
  count: number;
  averageOverall?: number;
  averageOrganization?: number;
  averageAtmosphere?: number;
  averageCommunityImpact?: number;
  recommendRate?: number;
}

@Component({
  selector: 'app-event-feedbacks-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DateFormatPipe,
  ],
  template: `
    <div class="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 class="text-2xl font-bold text-dark">Retours participants</h2>
          <p class="text-gray-600">{{ data.title }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <mat-spinner diameter="40" class="mx-auto"></mat-spinner>
      </div>

      <div *ngIf="!loading && stats.count === 0" class="text-center py-12">
        <mat-icon class="text-5xl text-gray-300 mb-4">rate_review</mat-icon>
        <p class="text-gray-600">Aucun retour pour le moment.</p>
      </div>

      <div *ngIf="!loading && stats.count > 0">
        <!-- Statistiques -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-primary">{{ stats.count }}</p>
            <p class="text-sm text-gray-600">Réponses</p>
          </div>
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-primary">{{ stats.averageOverall }}/5</p>
            <p class="text-sm text-gray-600">Note globale</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-green-600">{{ stats.recommendRate }}%</p>
            <p class="text-sm text-gray-600">Recommanderaient</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <p class="text-xl font-bold text-dark">{{ stats.averageOrganization }}/5</p>
            <p class="text-sm text-gray-600">Organisation</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <p class="text-xl font-bold text-dark">{{ stats.averageAtmosphere }}/5</p>
            <p class="text-sm text-gray-600">Ambiance</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <p class="text-xl font-bold text-dark">{{ stats.averageCommunityImpact }}/5</p>
            <p class="text-sm text-gray-600">Lien communautaire</p>
          </div>
        </div>

        <!-- Liste des retours -->
        <div class="space-y-4">
          <div *ngFor="let fb of feedbacks" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="font-semibold text-dark">{{ fb.user.firstName }} {{ fb.user.lastName }}</p>
                <p class="text-xs text-gray-500">{{ fb.createdAt | dateFormat }}</p>
              </div>
              <div class="flex items-center gap-1">
                <mat-icon *ngFor="let s of [1,2,3,4,5]" class="text-sm"
                  [class.text-primary]="s <= fb.overallRating"
                  [class.text-gray-300]="s > fb.overallRating">
                  star
                </mat-icon>
              </div>
            </div>

            <div *ngIf="fb.highlights" class="mb-2">
              <p class="text-xs font-semibold text-green-700 uppercase mb-1">Apprécié</p>
              <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ fb.highlights }}</p>
            </div>

            <div class="mb-2">
              <p class="text-xs font-semibold text-orange-700 uppercase mb-1">À améliorer</p>
              <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ fb.improvements }}</p>
            </div>

            <div *ngIf="fb.additionalComments">
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Remarques</p>
              <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ fb.additionalComments }}</p>
            </div>

            <div class="mt-2">
              <span class="text-xs px-2 py-1 rounded-full"
                [ngClass]="fb.wouldRecommend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ fb.wouldRecommend ? 'Recommanderait' : 'Ne recommanderait pas' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EventFeedbacksDialogComponent implements OnInit {
  loading = true;
  stats: FeedbackStats = { count: 0 };
  feedbacks: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EventFeedbacksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event,
    private eventsService: EventsService,
  ) {}

  ngOnInit(): void {
    this.eventsService.getEventFeedbacks(this.data.id).subscribe({
      next: (response) => {
        this.stats = response.stats;
        this.feedbacks = response.feedbacks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
