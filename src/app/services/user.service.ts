import { EventEmitter, Injectable, Output } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firestore, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { FirebaseService } from './firebase.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  groupChatOpen = false;
  showGroupAnswer: boolean = false;

  userStatus: { [key: string]: boolean } = {};
  userStatusFetched: { [userId: string]: boolean } = {};
  retryCount: { [userId: string]: number } = {};
  maxRetries = 5; // Maximum number of retries
  retryDelay = 1000; // 1 second delay between retries
  private _threadOpenStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  threadOpenStatus$ = this._threadOpenStatus.asObservable();



  public _user: User | null = null;

  // private selectedUserIdSource = new BehaviorSubject<string | null>(null);
  // selectedUserId$: Observable<string | null> = this.selectedUserIdSource.asObservable();

  private selectedChannelNameSource = new BehaviorSubject<string | null>(null);
  selectedChannelName$ = this.selectedChannelNameSource.asObservable();

  private selectedUserIdSubject = new BehaviorSubject<string | null>(null);
  selectedUserId$ = this.selectedUserIdSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private firebaseservice: FirebaseService
  ) {}

  setThreadStatus(status: boolean) {
    this._threadOpenStatus.next(status);
  }

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
      // console.log(uid)
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
          // this.selectedUserIdSubject.next(uid);
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

  getUserStatus(userId: string): boolean {
    if (!(userId in this.userStatusFetched)) {
      // Mark as being fetched
      this.userStatusFetched[userId] = true;

      this.retryCount[userId] = 0; // Initialize retry counter
    
      // Fetch the status with retries
      this.fetchUserStatusWithRetries(userId)
  
    // Return stored status or false if not yet determined
  }
  return this.userStatus[userId] !== undefined ? this.userStatus[userId] : false;
}

  fetchUserStatusWithRetries(userId: string) {
    // Try fetching the status
    this.firebaseservice.getUserStatus(userId).subscribe(status => {
      if (status && status.state && status.state == 'online') {
        // If we have a valid status, store it and stop retrying
        this.userStatus[userId] = status.state === 'online';
      } else if (this.retryCount[userId] < this.maxRetries) {
        // If the status is null/undefined and retry limit not reached, retry
        this.retryCount[userId]++;
        setTimeout(() => this.fetchUserStatusWithRetries(userId), this.retryDelay);
      } else {
        // If max retries reached, assume offline
        this.userStatus[userId] = false;
      }
    });
  }
}
