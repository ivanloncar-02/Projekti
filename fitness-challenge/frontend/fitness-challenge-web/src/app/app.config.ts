import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: route params (e.g. :userId) arrive as signal
    // inputs directly - DashboardPage doesn't need to inject ActivatedRoute.
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor])),
    // provideCharts (dashboard) and provideNativeDateAdapter (log-activity) live
    // on their own components' providers, not here - see B7. That keeps chart.js
    // and the datepicker's date adapter out of the initial bundle.
  ],
};
