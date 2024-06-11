import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SearchConfig {
  userName?: string;
  searchLimit?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  #httpClient = inject(HttpClient);

  findUsers({ userName = '', searchLimit = 5 }: SearchConfig) {
    return this.#httpClient.get<any[]>(
      `https://jsonplaceholder.typicode.com/users?name_like=^${userName}&_limit=${searchLimit}`
    );
  }
}
