import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    vi.spyOn(snackBar, 'open');
  });

  afterEach(() => httpMock.verify());

  // HttpClientTestingBackend delivers flush() synchronously, so these don't
  // need to be async - subscribe, flush, assert, all in one tick.

  it('does NOT show a toast for a 400 (a form is expected to map it onto its own controls)', () => {
    let caught: unknown;
    http.post('/api/activities', {}).subscribe({ error: (e: unknown) => (caught = e) });

    httpMock.expectOne('/api/activities').flush(
      { title: 'One or more validation errors occurred.', status: 400, errors: { sport: ['x'] } },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(caught).toBeTruthy();
    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('does NOT show a toast for a 409 (duplicate-name conflict - the register form shows it)', () => {
    let caught: unknown;
    http.post('/api/users', {}).subscribe({ error: (e: unknown) => (caught = e) });

    httpMock
      .expectOne('/api/users')
      .flush({ title: 'A user with this name already exists.' }, { status: 409, statusText: 'Conflict' });

    expect(caught).toBeTruthy();
    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('still shows a toast for a 500 - nothing else is positioned to surface it', () => {
    let caught: unknown;
    http.get('/api/users').subscribe({ error: (e: unknown) => (caught = e) });

    httpMock.expectOne('/api/users').flush('boom', { status: 500, statusText: 'Server Error' });

    expect(caught).toBeTruthy();
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('still shows a toast for a network failure (status 0)', () => {
    let caught: unknown;
    http.get('/api/users').subscribe({ error: (e: unknown) => (caught = e) });

    httpMock.expectOne('/api/users').error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(caught).toBeTruthy();
    expect(snackBar.open).toHaveBeenCalled();
  });
});
