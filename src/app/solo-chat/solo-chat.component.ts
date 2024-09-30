import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { addDoc, collection, getDocs, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Chat {
  text: string;
  timestamp: Timestamp | string; // Oder string, falls Timestamp anders dargestellt wird
  formattedTimestamp?: string;
  time: string;
  userName: string;
  userId: string;
  receivingUserId: string;
  isRead: boolean; // Neues Feld zum Verfolgen des Lesestatus
}

@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, HttpClientModule],
  templateUrl: './solo-chat.component.html',
  styleUrls: ['./solo-chat.component.scss'],
  providers: [DatePipe]
})
export class SoloChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollingContainer', { static: false }) scrollContainer!: ElementRef;
  user$: Observable<User | undefined> = of(undefined);
  user: User | null = null;
  loggedInUserName!: string;
  loggedInUserId!: string;
  userName!: string;
  chats: Chat[] = [];
  isChatBlinking: boolean = false;
  userImages = [];
  channelId = 'pEylXqZMW1zKPIC0VDXL'

  private chatsSubscription: Subscription | null = null;
  private chatListenerUnsubscribe: (() => void) | null = null;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute
  ) { 

  }

  async ngOnInit(): Promise<void> {
    this.initializeUserObservable();
    await this.initializeLoggedInUser();  // Warten, bis der eingeloggte User geladen ist
  }

  // Funktionen aus ngOnInit ausgelagert

  private initializeUserObservable(): void {
    this.user$ = this.userService.selectedUserId$.pipe(
      switchMap(userId => 
        this.handleUserSelection(userId)
      ),
      catchError(error => {
        // console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
  }

  private handleUserSelection(userId: string | null): Observable<User | undefined> {
    if (userId) {
      return this.loadUserAndListen(userId);
    } else {
      const lastSelectedUserId = this.userService.getLastSelectedUserId();
      console.log('solo', lastSelectedUserId)
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
        this.loggedInUserId = uid;  // Benutzer-ID setzen
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; // Benutzername setzen (falls verwendet)
        }

      }

    } catch (error) {
      // console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  // Lade Benutzerdaten aus Firestore
  loadUserData(userId: string | null): Observable<User | undefined> {
    if (!userId) {
      console.log('failed')
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
        // console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
  }

  // Echtzeit-Listener für die Chats eines Benutzers
listenToChats(userId: string): void {
  if (!this.loggedInUserId || !userId) {
    console.log('failed', userId, '+', this.loggedInUserId)
    return;
  }
  console.log('success', userId,'+', this.loggedInUserId)


  const chatId = this.createChatId(this.loggedInUserId, userId);
  const messagesCollectionRef = collection(this.firestore, `chats/${chatId}/messages`);

  this.chatListenerUnsubscribe = onSnapshot(messagesCollectionRef, (snapshot) => {
    if (!snapshot.empty) {
      const retrievedMessages = snapshot.docs.map(doc => doc.data());
      this.chats = this.formatMessages(retrievedMessages);

      // Prüfe, ob es ungelesene Nachrichten gibt
      const hasUnread = retrievedMessages.some(message => !message['isRead'] && message['receivingUserId'] === this.loggedInUserId);

      // Aktualisiere den Blink-Status
      this.isChatBlinking = hasUnread;

      // console.log('Formatted chats:', this.chats);
    } else {
      this.chats = [];
      this.isChatBlinking = false;
    }
  }, (error) => {
    // console.error('Fehler beim Abrufen der Chats:', error);
  });
}


  // Funktion, um die Chat-ID zu erstellen (basierend auf alphabetischer Sortierung der IDs)
  createChatId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();  // IDs alphabetisch sortieren
    return sortedIds.join('_');  // Kombiniere die sortierten IDs
  }


  getUserIdFromUrl(): string | null {
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      // console.log('Benutzer-ID aus der URL:', userId);
      return userId;
    } else {
      // console.log('Keine Benutzer-ID in der URL gefunden.');
      return null;
    }
  }

  formatMessageTime(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',    // Stunde
      minute: '2-digit',  // Minute
    });
  }

  formatMessages(messages: any[]): any[] {
    const sortedMessages = messages.sort((a, b) => {
      return a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime();
    });
  
    return sortedMessages.map(message => {
      return {
        ...message,
        timestamp: this.formatTimestamp(message.timestamp), // Datum formatieren
        time: this.formatMessageTime(message.timestamp),   // Zeit formatieren
        isRead: message.isRead // Status der Nachricht (gelesen/ungelesen)
      };
    });
  }
  formatTimestamp(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return 'Heute'; // Wenn Datum von heute ist
    } else {
      return date.toLocaleDateString('de-DE', { // Formatierung für deutsches Datum
        weekday: 'long',  // Wochentag
        day: '2-digit',   // Tag
        month: '2-digit', // Monat
        year: 'numeric'   // Jahr
      });
    }
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    this.scrollToBottom();
    const messagesCollectionRef = collection(this.firestore, `chats/${chatId}/messages`);
    
    const snapshot = await getDocs(messagesCollectionRef);
    this.scrollToBottom();

    const batch = writeBatch(this.firestore);
  
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data['receivingUserId'] === userId && !data['isRead']) {
        batch.update(doc.ref, { isRead: true });
      }
    });
  
    try {
      await batch.commit();
      // console.log('Messages marked as read.');
    } catch (error) {
      // console.error('Error marking messages as read:', error);
    }
  }


  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      // console.error('Scroll error:', err);
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

  ngAfterViewInit(): void {
    this.observeMutations();
  }

  observeMutations(): void {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver(() => {
      this.scrollToBottom();
    });

    observer.observe(this.scrollContainer.nativeElement, config);
  }

}
