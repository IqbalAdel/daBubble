import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Oder spezifische Module, falls du modulare Bereitstellung nutzt
})
export class UserService {

  groupChatOpen = true;

  private _user: User | null = null;
  private selectedUserIdSource = new BehaviorSubject<string | null>(null);
  selectedUserId$: Observable<string | null> = this.selectedUserIdSource.asObservable();

  setUser(user: User): void {
    this._user = user;
  }

  getUser(): User | null {
    return this._user;
  }

  setSelectedUserId(userId: string | null) {
    this.selectedUserIdSource.next(userId);
  }
  
}

