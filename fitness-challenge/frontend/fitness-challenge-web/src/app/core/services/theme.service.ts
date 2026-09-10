import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Owns the light/dark mode: applies it to <html> via the color-scheme style
 * property and persists the explicit choice to localStorage. Exposed as a
 * signal so other consumers (B4's charts re-resolve --sport-* and --mat-sys-*
 * colours and call chart.update() when this changes) can react without
 * re-implementing the toggle.
 *
 * Until the user makes an explicit choice, <html> keeps the `color-scheme:
 * light dark` authored in styles.scss and just follows the OS preference -
 * this service only starts writing to localStorage/<html> once toggled.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.initialMode());

  toggle(): void {
    const next: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.mode.set(next);
    document.documentElement.style.colorScheme = next;
    localStorage.setItem(STORAGE_KEY, next);
  }

  private initialMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.style.colorScheme = stored;
      return stored;
    }

    // No explicit choice yet - reflect the OS preference for the toggle
    // icon's initial state, but don't write it anywhere or touch <html>.
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
