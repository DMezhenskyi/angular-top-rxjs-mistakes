import { Component } from '@angular/core';
import { UserSearchComponent } from './user-search/user-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserSearchComponent],
  template: `
    <app-user-search />
  `,
})
export class AppComponent {}
