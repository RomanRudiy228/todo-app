import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refresh$ = null as null | ReturnType<AuthService['refresh']>;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const withCreds = authReq.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register') && !req.url.includes('/auth/refresh')) {
        if (!refresh$) {
          refresh$ = auth.refresh().pipe(
            finalize(() => {
              refresh$ = null;
            }),
            shareReplay({ bufferSize: 1, refCount: false })
          );
        }

        return refresh$.pipe(
          switchMap(() => {
            const newToken = auth.getAccessToken();
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` }, withCredentials: true })
              : req.clone({ withCredentials: true });
            return next(retryReq);
          }),
          catchError(refreshError => {
            auth.clearSession();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
