import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { UsersService, User } from '../users.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
  <h1>Users Search</h1>
  <form [formGroup]="searchConfigForm">
    <label>User Name
      <input formControlName="userName" placeholder="Type User Name" />
    </label>
    <label>Results Limit
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
`
})
export class UserSearchComponent {
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

  destroyRef = inject(DestroyRef);
  usersService = inject(UsersService);
  users: User[] = [];
  
  ngOnInit() {
    this.searchConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchConfig) => {
        this.usersService.findUsers(searchConfig).subscribe((users) => {
          this.users = users;
        });
      });
  }
}
