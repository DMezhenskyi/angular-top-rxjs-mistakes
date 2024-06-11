import { Component, DestroyRef, inject } from '@angular/core';
import { UsersService } from './users.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, debounceTime, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="searchConfigForm">
      <h1>Users Search</h1>
      <label for="user-name">User Name</label>
      <input
        formControlName="userName"
        id="user-name"
        type="text"
        placeholder="User Name"
      />

      <label for="search-limit">Results Per Page</label>
      <select formControlName="searchLimit" id="search-limit">
        <option [value]="1">1</option>
        <option [value]="3">3</option>
        <option [value]="5">5</option>
      </select>
    </form>
    <p>Found {{ users.length }} Users</p>
    <ul>
      @for (user of users; track user.id) {
      <li>{{ user.name }}</li>
      }
    </ul>
  `,
})
export class AppComponent {
  #usersService = inject(UsersService);
  searchConfigForm = new FormGroup({
    userName: new FormControl('', { nonNullable: true }),
    searchLimit: new FormControl(1, { nonNullable: true }),
  });

  searchConfig$ = this.searchConfigForm.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    map((config) => {
      const trimmedConfig = {
        ...config,
        userName: config.userName?.trim() || '',
      };
      localStorage.setItem('searchConfig', JSON.stringify(trimmedConfig));
      return trimmedConfig;
    })
  );

  users: any[] = [];
  destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.searchConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchConfig) => {
        this.#usersService.findUsers(searchConfig).subscribe((users) => {
          this.users = users;
        });
      });
  }
}
