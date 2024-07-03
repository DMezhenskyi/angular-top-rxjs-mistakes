import { Component, computed, signal } from '@angular/core';
import { UserSearchComponent } from './user-search/user-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserSearchComponent],
  template: `
    <button (click)="show.set(!show())">{{ buttonText() }}</button>
    @if (show()) {
      <app-user-search />
    }
  `,
})
export class AppComponent {
  show = signal(true);
  buttonText = computed(() => (this.show() ? 'Hide Search' : 'Show Search'));
}
