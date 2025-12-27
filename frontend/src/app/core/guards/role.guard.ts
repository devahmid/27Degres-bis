import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const requiredRole = route.data['role'];

  if (!requiredRole) {
    return true;
  }

  return authService.hasRole(requiredRole);
};









