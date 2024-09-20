import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firestore, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  groupChatOpen = false;
  showGroupAnswer: boolean = false;


  public _user: User | null = null;

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

  getUserProfilePicture(): string {
    return this._user?.img || 'assets/img/default-avatar.png'; // Standardbild, falls kein Profilbild vorhanden ist
  }

  getUser(): User | null {
    return this._user ? new User(this._user) : null;
  }

  selectUser(userId: string) {
    this.selectedUserIdSubject.next(userId); // Sofort aktualisieren
  }

  async loadUserById(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        if (userData) {
          const user = new User(
              userData.name || '',
              userData.email || '',
              userData.id || '',
              userData.img || '',
              userData.password || '',
              userData.channels || [],
              userData.chats || []
          );
          this.setUser(user);
          this.selectedUserIdSubject.next(uid);
        }
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

  subscribeToUserChanges(uid: string, callback: (user: User) => void): void {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const updatedUser = new User(doc.data() as User);
        callback(updatedUser);
      }
    });
  }
}
