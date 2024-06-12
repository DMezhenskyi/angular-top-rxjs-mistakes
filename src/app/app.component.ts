import { Component, DestroyRef, inject } from '@angular/core';
import { User, UsersService } from './users.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, debounceTime, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1>Users Search</h1>
    <form [formGroup]="searchConfigForm">
      <label
        >User Name
        <input
          formControlName="userName"
          type="text"
          placeholder="Type User Name"
        />
      </label>
      <label
        >Results Limit
        <select formControlName="resultLimit">
          <option [value]="1">1</option>
          <option [value]="3">3</option>
          <option [value]="5">5</option>
        </select>
      </label>
    </form>
    <p>
      Found <b>{{ users.length }}</b> Users
    </p>
    <ul>
      @for (user of users; track user.id) {
        <li class="card">{{ user.name }}</li>
      }
    </ul>
  `,
})
export class AppComponent {
  searchConfigForm = new FormGroup({
    userName: new FormControl('', { nonNullable: true }),
    resultLimit: new FormControl(3, { nonNullable: true }),
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

  users: User[] = [];
  destroyRef = inject(DestroyRef);
  #usersService = inject(UsersService);

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
