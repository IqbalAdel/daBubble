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
import { arrayUnion, collection, DocumentReference, getDocs, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileUserCenterComponent } from '../dialogs/dialog-profile-user-center/dialog-profile-user-center.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';


interface Chat {
  id: string;
  text: string;
  timestamp: Timestamp | string; // oder string
  formattedTimestamp?: string;
  time: string;
  userName: string;
  userId: string;
  receivingUserId: string;
  isRead: boolean;
  smileys: { emoji: string; userNames: string[] }[];
}

@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, HttpClientModule, PickerModule],
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
  supportsTouch: boolean = false;
  isMobile: boolean = false;
  imgSrc = ['assets/img/smiley/add_reaction.svg', 'assets/img/smiley/comment.svg', 'assets/person_add.svg', 'assets/more_vert.svg'];
  showSmileyPicker = false;
  private chatsSubscription: Subscription | null = null;
  private chatListenerUnsubscribe: (() => void) | null = null;
  activeChatIndex: number | null = null;
  messageId: string | null = null;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private dialogProfile: MatDialog,
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.initializeUserObservable();
    await this.initializeLoggedInUser();
    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (this.supportsTouch && window.innerWidth < 992) {
      this.isMobile = true;
    }

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
      return;
    }

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
      return userId;
    } else {
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
    } catch (error) {
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

  openDialogMemberProfile(user: User) {
    this.dialogProfile.open(DialogProfileUserCenterComponent, {
      panelClass: 'border-30-right',
      data: {
        username: user.name,
        email: user.email,
        image: user.img,
        user: user,
        status: this.userService.getUserStatus(user.id)
      }

    });
  }

  changeImageSmiley(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/img/smiley/add_reaction-blue.svg' : 'assets/img/smiley/add_reaction.svg';
  }

  openSmiley(chatIndex: number) {
    const chat = this.chats[chatIndex]; // Hol das chat-Objekt anhand des Index
  
    if (!chat) {
      console.warn('Kein Chat gefunden für Index:', chatIndex);
      return; // Beende die Methode, wenn kein Chat gefunden wird
    }
  
    if (this.activeChatIndex === chatIndex) {
      this.activeChatIndex = null;  // Picker schließen, wenn bereits geöffnet
    } else {
      this.activeChatIndex = chatIndex;  // Emoji-Picker öffnen
    }
  
    // Hier rufst du onChatClick mit dem korrekten chat-Objekt auf
    this.onChatClick(chat.receivingUserId, chat.text);
  }
  
  
  addSmiley(event: any) {
    const selectedEmoji = event.emoji.native;  
    // Überprüfe, ob die messageId gesetzt ist
    if (this.messageId) {
      // Hole den Chat mit dem aktiven Index
      const selectedChat = this.chats[this.activeChatIndex!]; // activeChatIndex muss gesetzt sein
  
      if (selectedChat) {
        console.log('Speichere Smiley für messageId:', this.messageId); // Protokolliere die messageId
        // Rufe saveSmiley auf
        this.saveSmiley(selectedEmoji, selectedChat.receivingUserId, this.messageId);
      } else {
        console.warn('Kein Chat gefunden für activeChatIndex:', this.activeChatIndex);
      }
    } else {
      console.warn('Keine messageId gefunden. Emoji kann nicht gespeichert werden.');
    }
  }
  

  saveSmiley(emoji: string, receivingUserId: string, messageId: string) {
  if (!this.validateUserAndMessageId()) return;

  // Erstelle die Chat-ID mit beiden Benutzer-IDs in alphabetischer Reihenfolge
  const chatId = this.firebaseService.createChatId(receivingUserId, this.user!.id); // Um sicherzustellen, dass die Reihenfolge egal ist
  if (!chatId) {
    console.warn('Ungültige Chat-ID.');
    return;
  }

  const messageDocRef = this.getMessageDocRef(chatId, messageId);
  if (!messageDocRef) return;

  this.updateMessageWithSmiley(messageDocRef, emoji);
  this.activeChatIndex = null; // Setze den aktiven Chat-Index zurück
}

  
  
  
  private validateUserAndMessageId(): boolean {
    if (!this.user) {
      console.warn('User not available.');
      return false;
    }
    return true;
  }
  
  private getMessageDocRef(chatId: string, messageId: string) {
    if (!messageId) {
      console.warn('Ungültige messageId:', messageId);
      return null;
    }
    const docRef = doc(this.firestore, 'chats', chatId, 'messages', messageId);
    console.log('Document Reference:', docRef); // Füge diese Zeile hinzu
    return docRef;
  }
  
  private updateMessageWithSmiley(messageDocRef: DocumentReference, emoji: string) {
    if (!this.user) return; // Überprüfe erneut, ob der Benutzer vorhanden ist

    // Smiley-Daten mit userName als Array
    const smileyData = {
      emoji: emoji,
      userNames: [this.user.name] // userName als Array initialisieren
    };

    updateDoc(messageDocRef, {
      smileys: arrayUnion(smileyData) // arrayUnion sorgt dafür, dass keine doppelten Einträge entstehen
    }).then(() => {
      console.log('Smiley erfolgreich gespeichert.');
    }).catch(error => {
      console.error('Fehler beim Speichern des Smileys:', error);
    });
}

  

  onChatClick(receivingUserId: string, messageText: string) {
    if (!this.user) {
      console.warn('User is not available.');
      return;
    }
  
    const chatId = this.firebaseService.createChatId(this.user.id, receivingUserId);
    if (!chatId) {
      console.warn('Chat ID konnte nicht erstellt werden.');
      return;
    }
  
    console.log('Chat ID:', chatId); // Protokolliere die Chat ID
    this.fetchMessageId(chatId, messageText);
  }
  
  fetchMessageId(chatId: string, messageText: string) {
    const chatDocRef = doc(this.firestore, 'chats', chatId);
    
    getDocs(collection(chatDocRef, 'messages')).then((querySnapshot) => {
      let found = false; // Flag, um festzustellen, ob die messageId gefunden wurde
  
      querySnapshot.forEach((doc) => {
        if (doc.data()['text'] === messageText) {
          this.messageId = doc.id; // Speichere die messageId
          found = true; // Setze das Flag auf true
          console.log('Found message ID:', this.messageId); // Debugging-Ausgabe
        }
      });
  
      if (!found) {
        console.warn('Keine messageId gefunden für den Text:', messageText);
      }
    }).catch((error) => {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
    });
  }

  toggleSmiley(selectedSmiley: { emoji: string; userNames: string[] }) {
    console.log('Smiley clicked:', selectedSmiley); // Debugging

    const activeChat = this.getActiveChat(); // Hole den aktiven Chat
    if (!activeChat || !activeChat.smileys || !this.user) return; // Sicherheitsüberprüfung

    const index = activeChat.smileys.findIndex((smiley: { emoji: string; userNames: string[] }) => 
        smiley.emoji === selectedSmiley.emoji
    );

    if (index > -1) {
        // Smiley existiert bereits, also entfernen
        const userIndex = activeChat.smileys[index].userNames.indexOf(this.user.name);
        if (userIndex > -1) {
            activeChat.smileys[index].userNames.splice(userIndex, 1); // Entferne den Benutzernamen
        }

        // Wenn keine Benutzernamen mehr vorhanden sind, entferne den Smiley
        if (activeChat.smileys[index].userNames.length === 0) {
            activeChat.smileys.splice(index, 1);
        }
    } else {
        // Smiley existiert nicht, also hinzufügen
        activeChat.smileys.push({ emoji: selectedSmiley.emoji, userNames: [this.user.name] });
    }

    // Aktualisiere den Chat in der Datenbank
    this.updateChatWithSmileys(activeChat.id, activeChat.smileys);
}
  
  
  // Beispiel für die Aktualisierung der Datenbank
  private updateChatWithSmileys(chatId: string, smileys: any[]) {
    const chatDocRef = doc(this.firestore, 'chats', chatId);
    updateDoc(chatDocRef, {
      smileys: smileys
    }).then(() => {
      console.log('Chat aktualisiert:', smileys);
    }).catch(error => {
      console.error('Fehler beim Aktualisieren des Chats:', error);
    });
  }

  getActiveChat(): Chat | undefined {
    return this.chats[this.activeChatIndex!]; // Stelle sicher, dass `activeChatIndex` korrekt initialisiert ist
  }
  
  isUserReacted(smiley: { emoji: string; userNames: string[] }): string {
    if (!smiley || !smiley.userNames) return '';
  
    const hasReacted = smiley.userNames.includes(this.loggedInUserName);
    const otherUsers = smiley.userNames.filter(userName => userName !== this.loggedInUserName);
  
    if (hasReacted && otherUsers.length > 0) {
      // Wenn der angemeldete Benutzer und andere Benutzer reagiert haben
      return `${otherUsers.join(', ')} und Du haben reagiert`;
    } else if (hasReacted) {
      // Wenn nur der angemeldete Benutzer reagiert hat
      return 'Du hast reagiert';
    } else if (otherUsers.length > 0) {
      // Wenn nur andere Benutzer reagiert haben
      return `${otherUsers.join(', ')} hat reagiert`;
    }
  
    return ''; // Wenn niemand reagiert hat
  }
  

}
