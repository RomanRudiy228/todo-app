import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

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
        if (!isRefreshing) {
          isRefreshing = true;
          return auth.refresh().pipe(
            switchMap(() => {
              isRefreshing = false;
              const newToken = auth.getAccessToken();
              const retryReq = newToken
                ? req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` },
                    withCredentials: true
                  })
                : req.clone({ withCredentials: true });
              return next(retryReq);
            }),
            catchError(refreshError => {
              isRefreshing = false;
              auth.clearSession();
              return throwError(() => refreshError);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
