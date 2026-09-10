import { Component, input } from '@angular/core';

/**
 * Generic wrapper for a dashboard chart: title + projected toggle controls in
 * the header, a fixed-height canvas slot (chart.js needs maintainAspectRatio:
 * false plus a sized parent, not an intrinsic size of its own), and a
 * projected visually-hidden text summary for screen readers (spec section 8:
 * "every chart needs a visually-hidden text summary or a table fallback").
 */
@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.scss',
})
export class ChartCard {
  readonly title = input.required<string>();
}
