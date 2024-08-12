import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root' // Oder spezifische Module, falls du modulare Bereitstellung nutzt
})
export class UserService {

  groupChatOpen = true;

  private _user: User | null = null;

  setUser(user: User): void {
    this._user = user;
  }

  getUser(): User | null {
    return this._user;
  }
  
}

