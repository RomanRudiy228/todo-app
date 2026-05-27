import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  auth.restoreSession();

  if (auth.isLoggedIn()) {
    return true;
  }

  return auth.refresh().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  auth.restoreSession();

  if (!auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
