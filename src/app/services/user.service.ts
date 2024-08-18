import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
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

  constructor(private firestore: Firestore) {}

  setUser(user: User | null): void {
    this._user = user;
  }

  getUser(): User | null {
    return this._user;
  }

  async loadUserById(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        this.setUser(userData);
        this.selectedUserIdSubject.next(uid);
      } else {
        console.warn('Benutzerdokument nicht gefunden!');
        this.setUser(null);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
    }
  }

  setSelectedChannelName(channelName: string | null) {
    this.selectedChannelNameSource.next(channelName);
  }

  getLastSelectedUserId(): string | null {
    return localStorage.getItem('lastSelectedUserId');
  }

  setSelectedUserId(userId: string | null): void {
    this.selectedUserIdSubject.next(userId);
    if (userId) {
      localStorage.setItem('lastSelectedUserId', userId);
    } else {
      localStorage.removeItem('lastSelectedUserId');
    }
  }
}
