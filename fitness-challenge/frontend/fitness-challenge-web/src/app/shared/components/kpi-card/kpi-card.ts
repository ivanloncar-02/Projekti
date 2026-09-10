import { Component, input } from '@angular/core';

/** One stat tile: big number + small label. Dashboard renders five of these
 * on a CSS auto-fit grid (spec section 8). */
@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
}
