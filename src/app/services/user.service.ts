import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  groupChatOpen = false;

  private _user: User | null = null;

  // private selectedUserIdSource = new BehaviorSubject<string | null>(null);
  // selectedUserId$: Observable<string | null> = this.selectedUserIdSource.asObservable();

  private selectedChannelNameSource = new BehaviorSubject<string | null>(null);
  selectedChannelName$ = this.selectedChannelNameSource.asObservable();

  private selectedUserIdSubject = new BehaviorSubject<string | null>(null);
  selectedUserId$ = this.selectedUserIdSubject.asObservable();

  setUser(user: User): void {
    this._user = user;
  }

  getUser(): User | null {
    return this._user;
  }

  setSelectedUserId(userId: string | null): void {
    this.selectedUserIdSubject.next(userId);
    // Optionale Speicherung in LocalStorage, falls gewünscht
    if (userId) {
      localStorage.setItem('lastSelectedUserId', userId);
    } else {
      localStorage.removeItem('lastSelectedUserId');
    }
  }

  setSelectedChannelName(channelName: string | null) {
    this.selectedChannelNameSource.next(channelName);
  }

  getLastSelectedUserId(): string | null {
    return localStorage.getItem('lastSelectedUserId');
  }
  
  
}
