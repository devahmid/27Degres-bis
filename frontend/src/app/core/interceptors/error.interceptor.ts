import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/auth/login']);
        notification.showError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.status === 403) {
        notification.showError('Accès refusé.');
      } else if (error.status >= 500) {
        notification.showError('Erreur serveur. Veuillez réessayer plus tard.');
      } else if (error.error?.message) {
        notification.showError(error.error.message);
      } else {
        notification.showError('Une erreur est survenue.');
      }

      return throwError(() => error);
    })
  );
};

