import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  function setup(overrides?: Partial<AuthService>) {
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as never);

    const auth = jasmine.createSpyObj<AuthService>('AuthService', ['restoreSession', 'isLoggedIn', 'refresh']);
    auth.restoreSession.and.stub();
    auth.isLoggedIn.and.returnValue(overrides?.isLoggedIn ? (overrides.isLoggedIn as any)() : false);
    if (overrides?.refresh) {
      auth.refresh.and.callFake(overrides.refresh as any);
    } else {
      auth.refresh.and.returnValue(of({ accessToken: 't', expiresAt: new Date(Date.now() + 60_000).toISOString() }));
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    return { auth, router };
  }

  it('returns true when logged in', () => {
    const { auth } = setup({ isLoggedIn: (() => true) as never });
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
    expect(auth.refresh).not.toHaveBeenCalled();
  });

  it('tries refresh and allows on success', done => {
    const { auth } = setup({
      isLoggedIn: (() => false) as never,
      refresh: (() => of({ accessToken: 't', expiresAt: new Date(Date.now() + 60_000).toISOString() })) as never,
    });

    const result = TestBed.runInInjectionContext(() => authGuard(route, state)) as any;
    result.subscribe((v: any) => {
      expect(v).toBe(true);
      expect(auth.refresh).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('redirects to /login when refresh fails', done => {
    const { auth, router } = setup({
      isLoggedIn: (() => false) as never,
      refresh: (() => throwError(() => new Error('refresh failed'))) as never,
    });

    const result = TestBed.runInInjectionContext(() => authGuard(route, state)) as any;
    result.subscribe(() => {
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});

