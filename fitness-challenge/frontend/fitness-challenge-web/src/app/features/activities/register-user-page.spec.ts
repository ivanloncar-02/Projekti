import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterUserPage } from './register-user-page';

// `form` is `protected` (template-only, per this codebase's convention) -
// bracket notation is the standard escape hatch used elsewhere (see B4's
// sport-breakdown-chart.spec.ts) to reach it from a spec without weakening
// the component's own public API.
function formOf(fixture: ComponentFixture<RegisterUserPage>) {
  return fixture.componentInstance['form'];
}

describe('RegisterUserPage', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<RegisterUserPage>;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterUserPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    vi.spyOn(snackBar, 'open');
    fixture = TestBed.createComponent(RegisterUserPage);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function submit(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('does not submit when both fields are empty - marks them required instead', () => {
    submit();
    httpMock.expectNone('/api/users');
    expect(formOf(fixture).controls.firstName.errors?.['required']).toBeTruthy();
    expect(formOf(fixture).controls.lastName.errors?.['required']).toBeTruthy();
  });

  it('submits and shows a snackbar with the returned id on success', () => {
    formOf(fixture).setValue({ firstName: 'Ivan', lastName: 'Horvat' });
    submit();

    httpMock.expectOne('/api/users').flush({ id: 'new-id-123' });

    expect(snackBar.open).toHaveBeenCalledWith('User created - id new-id-123', 'Dismiss', { duration: 5000 });
    expect(formOf(fixture).controls.firstName.value).toBe('');
  });

  it('renders a 409 duplicate-name conflict under lastName, not as a generic message', () => {
    formOf(fixture).setValue({ firstName: 'Ivan', lastName: 'Horvat' });
    submit();

    httpMock
      .expectOne('/api/users')
      .flush({ title: 'A user with this name already exists.' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(formOf(fixture).controls.lastName.errors?.['server']).toBe('A user with this name already exists.');
  });

  it('maps a 400 ValidationProblemDetails onto the matching control', () => {
    formOf(fixture).setValue({ firstName: 'Ivan', lastName: 'Horvat' });
    submit();

    httpMock.expectOne('/api/users').flush(
      { title: 'One or more validation errors occurred.', status: 400, errors: { firstName: ['Too long.'] } },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(formOf(fixture).controls.firstName.errors?.['server']).toBe('Too long.');
  });
});
