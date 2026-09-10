import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/** Generic "nothing to show" placeholder - reused wherever a list/result set is empty. */
@Component({
  selector: 'app-empty-state',
  imports: [MatIcon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly icon = input<string>('inbox');
  readonly message = input.required<string>();
}
