import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

// TODO: Implement loading service if needed
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Add loading logic here if needed
  return next(req).pipe(
    finalize(() => {
      // Hide loading indicator
    })
  );
};









