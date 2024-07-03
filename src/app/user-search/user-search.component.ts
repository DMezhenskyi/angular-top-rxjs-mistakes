import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilKeyChanged, map, shareReplay, switchMap, tap } from 'rxjs';
import { UsersService } from '../users.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
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
    Found <b>{{ (users$ | async)?.length }}</b> Users
  </p>
  <ul>
    @for (user of (users$ | async); track user.id) {
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
    distinctUntilKeyChanged('userName'),
    map((config) => {
      const trimmedConfig = {
        ...config,
        userName: config.userName?.trim() || '',
      };
      return trimmedConfig;
    }),
    tap((trimmedConfig) => localStorage.setItem('searchConfig', JSON.stringify(trimmedConfig)))
  );

  usersService = inject(UsersService);
  users$ = this.searchConfig$.pipe(
    switchMap((searchConfig) => this.usersService.findUsers(searchConfig)),
    shareReplay(1)
  )

}
