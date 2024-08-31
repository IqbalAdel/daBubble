import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Firestore, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Observable, of, from, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';  // tap hinzugefügt
import { User } from '../../models/user.class';
import { ChatComponent } from '../chat/chat.component';
import { HttpClientModule } from '@angular/common/http';
import { FirebaseService } from '../services/firebase.service';
import { collection, Timestamp } from 'firebase/firestore';
import { DatePipe } from '@angular/common';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';

interface Chat {
  text: string;
  timestamp: Timestamp | string; // Oder string, falls Timestamp anders dargestellt wird
  formattedTimestamp?: string;
  time: string;
  userName: string;
  userId: string;
  receivingUserId: string;
}

@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, HttpClientModule],
  templateUrl: './solo-chat.component.html',
  styleUrls: ['./solo-chat.component.scss'],
  providers: [DatePipe]
})
export class SoloChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  user$: Observable<User | undefined> = of(undefined);
  user: User | null = null;
  loggedInUserName!: string;
  loggedInUserId!: string;
  userName!: string;
  chats: Chat[] = [];

  private chatsSubscription: Subscription | null = null;
  private chatListenerUnsubscribe: (() => void) | null = null;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private firebaseService: FirebaseService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.initializeUserObservable();
    await this.initializeLoggedInUser();  // Warten, bis der eingeloggte User geladen ist
  }

  // Funktionen aus ngOnInit ausgelagert

  private initializeUserObservable(): void {
    this.user$ = this.userService.selectedUserId$.pipe(
      switchMap(userId => this.handleUserSelection(userId)),
      catchError(error => {
        console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
  }

  private handleUserSelection(userId: string | null): Observable<User | undefined> {
    if (userId) {
      return this.loadUserAndListen(userId);
    } else {
      const lastSelectedUserId = this.userService.getLastSelectedUserId();
      if (lastSelectedUserId) {
        return this.loadUserAndListen(lastSelectedUserId);
      } else {
        return of(undefined);
      }
    }
  }

  private loadUserAndListen(userId: string): Observable<User | undefined> {
    return this.loadUserData(userId).pipe(
      tap(user => {
        if (user) {
          this.listenToChats(user.id); // Echtzeit-Chat-Listener starten
        }
      })
    );
  }

  async initializeLoggedInUser(): Promise<void> {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserId = this.user.id;  // Benutzer-ID setzen
          this.loggedInUserName = this.user.name; // Benutzername setzen (falls verwendet)
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  // Lade Benutzerdaten aus Firestore
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
            userData['password'] || '',
            userData['receivingId']
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

  // Echtzeit-Listener für die Chats eines Benutzers
  listenToChats(userId: string): void {
    if (!this.loggedInUserId || !userId) {
      return;
    }
  
    // Chat-ID basierend auf den beiden Benutzer-IDs erstellen
    const chatId = this.createChatId(this.loggedInUserId, userId);
  
    // Nachrichten aus der `chats/{chatId}/messages` Collection laden
    const messagesCollectionRef = collection(this.firestore, `chats/${chatId}/messages`);
  
    this.chatListenerUnsubscribe = onSnapshot(messagesCollectionRef, (snapshot) => {
      if (!snapshot.empty) {
        this.chats = this.processChatsSnapshot(snapshot); // Verarbeite und filtere die Nachrichten
      } else {
        this.chats = []; // Falls keine Nachrichten vorhanden sind
      }
    }, (error) => {
      console.error('Fehler beim Anhören der Chats:', error);
    });
  }

  // Funktion, um die Chat-ID zu erstellen (basierend auf alphabetischer Sortierung der IDs)
createChatId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();  // IDs alphabetisch sortieren
  return sortedIds.join('_');  // Kombiniere die sortierten IDs
}

  private processChatsSnapshot(snapshot: { docs: QueryDocumentSnapshot[] }): Chat[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setze Zeit auf Mitternacht für den Vergleich
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Gestern

    const chats = snapshot.docs.map(doc => {
        const data = doc.data() as Chat;
        let date: Date | null = this.convertTimestamp(data.timestamp);

        return this.formatChatData(data, date, today, yesterday);
    });

    return this.filterAndSortChats(chats);
}
  private convertTimestamp(timestamp: Timestamp | string): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp);
    } else {
      return new Date();
    }
  }

  private filterAndSortChats(chats: Chat[]): Chat[] {
    return chats
        .filter(chat =>
            chat.userId === this.loggedInUserId || chat.receivingUserId === this.loggedInUserId
        )
        .sort((a, b) => {
            const dateA = this.convertTimestamp(a.timestamp);
            const dateB = this.convertTimestamp(b.timestamp);
            return dateA.getTime() - dateB.getTime();
        });
}
  
  
  private formatChatData(data: Chat, date: Date, today: Date, yesterday: Date): Chat {
    const formattedTimestamp = this.getFormattedDate(date, today, yesterday);
    const formattedTime = this.datePipe.transform(date, 'HH:mm', 'de-DE') || '';
  
    return {
      ...data,
      formattedTimestamp: formattedTimestamp,
      time: formattedTime || data.time
    };
  }
  
  private getFormattedDate(date: Date, today: Date, yesterday: Date): string {
    if (this.isSameDay(date, today)) {
      return 'Heute';
    } else if (this.isSameDay(date, yesterday)) {
      return 'Gestern';
    } else {
      return this.datePipe.transform(date, 'EEEE, dd.MM.yyyy', 'de-DE') || '';
    }
  }
  
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getUserIdFromUrl(): string | null {
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      console.log('Benutzer-ID aus der URL:', userId);
      return userId;
    } else {
      console.log('Keine Benutzer-ID in der URL gefunden.');
      return null;
    }
  }
  

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.chatsSubscription) {
      this.chatsSubscription.unsubscribe();
    }

    if (this.chatListenerUnsubscribe) {
      this.chatListenerUnsubscribe(); // Listener entfernen
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();  // Automatisches Scrollen
  }
}
