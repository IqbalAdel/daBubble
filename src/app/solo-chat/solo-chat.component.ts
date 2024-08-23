import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot } from '@angular/fire/firestore'; // onSnapshot hinzufügen
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
  userId:string;
}


@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, HttpClientModule],
  templateUrl: './solo-chat.component.html',
  styleUrls: ['./solo-chat.component.scss']
})
export class SoloChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  user$: Observable<User | undefined> = of(undefined);
  user: User | null = null;
  loggedInUserName!: string;
  userName!: string;
  chats: { text: string; timestamp: string; time: string; userName: string; userId:string; }[] = [];
  private chatsSubscription: Subscription | null = null;
  private chatListenerUnsubscribe: (() => void) | null = null; // Variable für Echtzeit-Listener

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
                this.listenToChats(user.id); // Auf Echtzeit-Updates hören
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
                  this.listenToChats(user.id); // Auf Echtzeit-Updates hören
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
    const chatsRef = this.firebaseService.getChatsRef();
  }

  ngOnDestroy(): void {
    if (this.chatsSubscription) {
      this.chatsSubscription.unsubscribe();
    }

    if (this.chatListenerUnsubscribe) {
      this.chatListenerUnsubscribe(); // Listener entfernen, wenn die Komponente zerstört wird
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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

  // Echtzeit-Listener für die Chats eines Benutzers
  listenToChats(userId: string): void {
    const userDocRef = doc(this.firestore, `users/${userId}`);

    this.chatListenerUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const chats = userData?.['chats'] as Chat[] || [];
        this.chats = chats.map(chat => ({
          text: chat.text || '',
          timestamp: chat.timestamp || '',
          time: chat.time || '',
          userName: chat.userName || '',
          userId: chat.userId || ''
        }));
      } else {
        console.error('User document does not exist:', userId);
      }
    }, (error) => {
      console.error('Error listening to chats:', error);
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
