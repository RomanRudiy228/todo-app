import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
import { Subject, of, throwError } from 'rxjs';

describe('authInterceptor refresh queue', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getAccessToken', 'refresh', 'clearSession']);
    auth.getAccessToken.and.returnValue('expired-token');
    auth.refresh.and.returnValue(of({ accessToken: 'new-token', expiresAt: new Date(Date.now() + 60_000).toISOString() }));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('queues parallel 401s to a single refresh', () => {
    const refreshSubject = new Subject<{ accessToken: string; expiresAt: string }>();
    auth.refresh.and.returnValue(refreshSubject.asObservable() as never);

    // Two parallel API requests
    http.get('/api/tasks').subscribe();
    http.get('/api/categories').subscribe();

    const req1 = httpMock.expectOne('/api/tasks');
    const req2 = httpMock.expectOne('/api/categories');

    // Both fail with 401
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });
    req2.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Only one refresh should be called
    expect(auth.refresh).toHaveBeenCalledTimes(1);

    // Complete refresh now so retries happen.
    auth.getAccessToken.and.returnValue('new-token');
    refreshSubject.next({ accessToken: 'new-token', expiresAt: new Date(Date.now() + 60_000).toISOString() });
    refreshSubject.complete();

    // Interceptor retries both requests after refresh.
    const retry1 = httpMock.expectOne('/api/tasks');
    const retry2 = httpMock.expectOne('/api/categories');

    expect(retry1.request.withCredentials).toBeTrue();
    expect(retry2.request.withCredentials).toBeTrue();

    retry1.flush({} as never);
    retry2.flush({} as never);
  });

  it('clears session if refresh fails', done => {
    auth.refresh.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

    http.get('/api/tasks').subscribe({
      error: () => {
        expect(auth.clearSession).toHaveBeenCalled();
        done();
      },
    });

    const req = httpMock.expectOne('/api/tasks');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });
});

