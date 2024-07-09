import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilKeyChanged, map, MonoTypeOperatorFunction, Observable, ReplaySubject, shareReplay, startWith, switchMap, tap, timer } from 'rxjs';
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
    startWith(this.searchConfigForm.value),
    switchMap(
      (searchConfig) => timer(0, 3000).pipe(
        switchMap(() => this.usersService.findUsers(searchConfig))
      )
    ),
    myShareReplay(1)
  )
}
// simplified, custom version of the shareReplay() operator in rxjs
function myShareReplay<T>(bufferSize: number): MonoTypeOperatorFunction<T> {
  return (source) => {
    const connector = new ReplaySubject<T>(bufferSize);
    const sourceSub = source.subscribe(value => connector.next(value));
    let refCount = 0;

    return new Observable(subscriber => {
      refCount++;
      subscriber.add(() => {
        refCount--;
        if (refCount === 0) {
          sourceSub.unsubscribe()
        }
      })
      return connector.subscribe(value => subscriber.next(value))
    })
  }
}
