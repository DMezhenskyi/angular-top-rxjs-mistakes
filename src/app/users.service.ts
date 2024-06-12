import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SearchConfig {
  userName?: string;
  resultLimit?: number;
}
export interface User {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  #httpClient = inject(HttpClient);

  findUsers({ userName = '', resultLimit = 5 }: SearchConfig) {
    return this.#httpClient.get<User[]>(
      `https://jsonplaceholder.typicode.com/users?name_like=^${userName}&_limit=${resultLimit}`
    );
  }
}
