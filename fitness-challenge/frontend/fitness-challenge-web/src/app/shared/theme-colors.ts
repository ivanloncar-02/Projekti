import type { SportKey } from '../core/models/activity.model';

/**
 * Resolves --sport-* and --mat-sys-* CSS custom properties into real colour
 * values for Chart.js, which cannot read CSS variables itself. Re-resolve and
 * call chart.update() when the colour scheme changes (see CLAUDE.md rule 6 -
 * chart colours must never be hardcoded hex).
 *
 * Found while wiring B4's charts, verified by sampling actual canvas pixels
 * (not just the string), not assumed: getComputedStyle(...).getPropertyValue
 * on a *custom* property (as this file originally did) returns the raw
 * declared text, unresolved - and Angular Material 22's tokens are declared
 * as e.g. `--mat-sys-primary: light-dark(#005cbb, #abc7ff)` (see B1b). Handing
 * that literal "light-dark(...)" string to Canvas2D's fillStyle isn't a valid
 * <color> outside a real CSS property's used-value context, so the browser
 * silently drops the assignment and paints the fillStyle default (opaque
 * black) - in *both* colour schemes, identically. Screenshots of a chart with
 * plausible-looking dark bars would never have caught this.
 *
 * Fix: apply the var() to a real `color` property on a persistent, hidden,
 * connected probe element and read getComputedStyle on THAT property -
 * exactly what a real background-color/color declaration in a .scss file
 * does, and exactly why B1b's mat-toolbar check (reading .backgroundColor,
 * not a custom property) resolved correctly while this didn't.
 */
let probeElement: HTMLElement | null = null;

function resolvedColor(cssVarExpression: string): string {
  if (!probeElement) {
    probeElement = document.createElement('span');
    probeElement.style.display = 'none';
    document.body.appendChild(probeElement);
  }
  // Inherits color-scheme from <html> (ThemeService.toggle() sets it there),
  // so light-dark() resolves against whichever mode is actually active.
  probeElement.style.color = cssVarExpression;
  return getComputedStyle(probeElement).color;
}

export function sportColor(sport: SportKey): string {
  return resolvedColor(`var(--sport-${sport})`);
}

export function matSysColor(token: string): string {
  return resolvedColor(`var(--mat-sys-${token})`);
}

export function gridColor(): string {
  return matSysColor('outline-variant');
}

/**
 * Same resolution as matSysColor(), but returns an rgba(...) string at the
 * given alpha instead of the browser's opaque rgb(...) - B5's heatmap scales
 * one resolved hue (--mat-sys-primary) by alpha per cell rather than
 * resolving a different colour per cell.
 */
export function matSysColorWithAlpha(token: string, alpha: number): string {
  const rgb = matSysColor(token);
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
  if (!match) {
    return rgb; // unresolvable (e.g. jsdom in unit tests) - fall back rather than throw
  }
  const [, r, g, b] = match;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
