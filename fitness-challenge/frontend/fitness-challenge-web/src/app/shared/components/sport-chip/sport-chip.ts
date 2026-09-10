import { Component, computed, input } from '@angular/core';
import { sportLabel } from '../../../core/models/activity.helpers';
import type { SportKey } from '../../../core/models/activity.model';

/** Colour-coded pill for a sport, using --sport-* tokens (CLAUDE.md rule 6). */
@Component({
  selector: 'app-sport-chip',
  templateUrl: './sport-chip.html',
  styleUrl: './sport-chip.scss',
})
export class SportChip {
  readonly sport = input.required<SportKey>();

  protected readonly label = computed<string>(() => sportLabel(this.sport()));
}
