import { Component, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Observable, of, from, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { User } from '../../models/user.class';
import { ChatComponent } from '../chat/chat.component';
import { HttpClientModule } from '@angular/common/http';
import { FirebaseService } from '../services/firebase.service';


interface Chat {
  text: string;
  timestamp: string;
  time: string;
  userName: string;
}

@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, HttpClientModule],
  templateUrl: './solo-chat.component.html',
  styleUrls: ['./solo-chat.component.scss']
})
export class SoloChatComponent implements OnInit, OnDestroy {
  user$: Observable<User | undefined> = of(undefined);
  user: User | null = null;
  loggedInUserName!: string;
  userName!: string;
  chats: { text: string; timestamp: string; time: string; userName: string }[] = [];
  private chatsSubscription: Subscription | null = null;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private firebaseService: FirebaseService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.userService.selectedUserId$.pipe(
      switchMap(userId => {
        if (userId) {
          return this.loadUserData(userId).pipe(
            switchMap(user => {
              if (user) {
                this.loadChats(user.id); // Lädt die Chats für den Benutzer
                return of(user);
              } else {
                return this.loadDefaultUser();
              }
            })
          );
        } else {
          const lastSelectedUserId = this.userService.getLastSelectedUserId();
          if (lastSelectedUserId) {
            return this.loadUserData(lastSelectedUserId).pipe(
              switchMap(user => {
                if (user) {
                  this.loadChats(user.id); // Lädt die Chats für den Benutzer
                  return of(user);
                } else {
                  return this.loadDefaultUser();
                }
              })
            );
          } else {
            return this.loadDefaultUser();
          }
        }
      }),
      catchError(error => {
        console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
    this.loggedInUser();
  }

  ngOnDestroy(): void {
    if (this.chatsSubscription) {
      this.chatsSubscription.unsubscribe();
    }
  }

  async loggedInUser() {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; // Setze den Namen des eingeloggten Benutzers
          console.log('eingeloogter User', uid);
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  loadUserData(userId: string | null): Observable<User | undefined> {
    if (!userId) {
      return of(undefined);
    }

    const userDoc = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userDoc)).pipe(
      map(userSnapshot => {
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          return new User(
            userData['name'] || '',
            userData['email'] || '',
            userId,
            userData['img'] || '',
            userData['password'] || ''
          );
        } else {
          return undefined;
        }
      }),
      catchError(error => {
        console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
  }

  loadDefaultUser(): Observable<User | undefined> {
    // Hier wird der erste Benutzer geladen
    const usersCollection = collection(this.firestore, 'users');
    return from(getDocs(usersCollection)).pipe(
      map(querySnapshot => {
        const firstUserDoc = querySnapshot.docs[0];
        if (firstUserDoc) {
          const userData = firstUserDoc.data();
          return new User(
            userData['name'] || '',
            userData['email'] || '',
            firstUserDoc.id,
            userData['img'] || '',
            userData['password'] || ''
          );
        } else {
          return undefined;
        }
      }),
      catchError(error => {
        console.error('Error loading default user data:', error);
        return of(undefined);
      })
    );
  }

  async getChatsForUser(userId: string): Promise<Chat[]> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const chats = userData?.['chats'] as Chat[] || [];
        return chats;
      } else {
        console.error('User document does not exist:', userId);
        return [];
      }
    } catch (error) {
      console.error('Error getting chats for user:', error);
      return [];
    }
  }

  async loadChats(userId: string): Promise<void> {
    try {
      const chats = await this.getChatsForUser(userId);
      this.chats = chats.map(chat => ({
        text: chat.text || '',
        timestamp: chat.timestamp || '',
        time: chat.time || '',
        userName: chat.userName || ''
      }));
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }
}
