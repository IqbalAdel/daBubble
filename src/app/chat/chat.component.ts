import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service'; // Sicherstellen, dass der Import korrekt ist
import { addDoc, arrayUnion, collection, doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

export interface ChatMessage {
  text: string;
  timestamp: Timestamp; // Firestore Timestamp Typ verwenden
  time: string;
  userName: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']  // styleUrl zu styleUrls geändert, wenn das notwendig ist
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') messageInputRef!: ElementRef;

  channelId!: string;
  messages: any[] = [];
  placeholderText: string = 'Nachricht an #Gruppenname';
  user: User | null = null;
  receivingUserId: string | null = null;
  private messagesSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;
  userService: UserService; // Sicherstellen, dass userService in der Klasse deklariert ist
  userName!: string;

  constructor(private fireService: FirebaseService, private route: ActivatedRoute, userService: UserService, private firestore: Firestore) {
    this.userService = userService; // Initialisiere userService
  }

  ngOnInit(): void {
    // Beobachten Sie Änderungen in den URL-Parametern
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id']; // ID aus der URL
      if (id) {
        this.channelId = id;
        this.loadDataBasedOnId(id);
        this.setupMessageListener(id);
        this.loadCurrentUser(); // Die Methode laden, die den Benutzer lädt
        this.getUserIdFromUrl();
        this.getReceivingUserIdFromUrl();
      }
    });
  }

  ngOnDestroy(): void {
    // Abonnements aufheben, wenn die Komponente zerstört wird
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async loadCurrentUser() {
    try {
      const uid = await this.fireService.getCurrentUserUid();
      console.log('Current user UID:', uid);  // Debugging-Ausgabe für UID
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        console.log('Loaded user:', this.user);  // Debugging-Ausgabe für Benutzerobjekt
        if (this.user) {
          this.userName = this.user.name;  // Setze den Benutzernamen, falls erforderlich
        }
      } else {
        console.error('No UID retrieved');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  private setupMessageListener(channelId: string): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  
    this.messagesSubscription = this.fireService.getChannelsMessages(channelId)
      .subscribe(
        (messages) => {
          // Filtere oder überprüfe hier, ob die eigenen Nachrichten enthalten sind
          this.messages = messages;
          console.log('Messages updated:', this.messages);
        },
        (error) => {
          console.error('Error loading messages:', error);
        }
      );
  }

  private async loadDataBasedOnId(id: string): Promise<void> {
    try {
      const channel = await this.fireService.getChannelById(id);
      if (channel) {
        this.placeholderText = `Nachricht an #${channel.name}`;
      } else {
        const user = await this.fireService.getUserById(id);
        if (user) {
          this.placeholderText = `Nachricht an ${user.name}`;
        } else {
          this.placeholderText = 'Nachricht an #Gruppenname';
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten basierend auf der ID:', error);
    }
  }

  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];

  changeAdd(isHover: boolean) {
    this.imgTextarea[0] = isHover ? 'assets/img/smiley/add-blue.png' : 'assets/img/add.png';
  }

  addSmiley(isHover: boolean) {
    this.imgTextarea[1] = isHover ? 'assets/img/smiley/sentiment_satisfied-blue.png' : 'assets/img/smiley/sentiment_satisfied.png';
  }
  addEmailContact(isHover: boolean) {
    this.imgTextarea[2] = isHover ? 'assets/img/smiley/alternate_email-blue.png' : 'assets/img/smiley/alternate_email.png';
  }
  sendNews(isHover: boolean) {
    this.imgTextarea[3] = isHover ? 'assets/img/smiley/send-light-blue.png' : 'assets/img/smiley/send.png';
  }

  createChatId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();  // Alphabetische Sortierung
    return sortedIds.join('_');  // Kombinierte ID erstellen
  }

  sendMessageToUser(messageText: string, receivingUserId: string): void {
    if (!this.user) {
      console.error('User is not defined');
      return;
    }

    console.log('Sender User ID:', this.user.id);
    console.log('Receiving User ID:', receivingUserId);
  
    const chatId = this.createChatId(this.user.id, receivingUserId);  // Chat-ID zwischen den beiden Benutzern erstellen
    const message = {
      text: messageText,
      timestamp: Timestamp.now(),
      userName: this.user.name,
      userId: this.user.id,
      receivingUserId: receivingUserId,
      time: new Date().toLocaleTimeString()
    };
  
    // Nachricht in der Firestore-Collection für diesen Chat speichern
    const chatDocRef = doc(this.firestore, 'chats', chatId);
    addDoc(collection(chatDocRef, 'messages'), message)
      .then(() => console.log('Message sent successfully'))
      .catch(error => console.error('Error sending message:', error));
  }

  
  sendMessage(messageText: string): void {
    if (!this.user) {
      console.error('User is not defined');
      return;
    }
  
    const receivingUserId = this.getReceivingUserIdFromUrl();
    if (!receivingUserId) {
      console.error('Receiving user ID is not defined');
      return;
    }
  
    const messageInput = this.messageInputRef.nativeElement;
    const message = {
      text: messageText,
      timestamp: Timestamp.now(),
      userName: this.userName || 'Gast',
      userId: this.user.id,
      receivingUserId: receivingUserId,
      time: new Date().toLocaleTimeString()
    };
  
    console.log('Message object:', message);  // Debugging-Ausgabe für die Nachricht
  
    this.checkIfUserAndSendMessage(message, messageInput);
  }
  
  
  // Überprüft, ob die channelId eine User-ID ist und speichert entsprechend
  private checkIfUserAndSendMessage(message: any, messageInput: HTMLTextAreaElement): void {
    const userDocRef = doc(this.firestore, 'users', this.channelId);
  
    getDoc(userDocRef)
      .then((userSnapshot) => {
        if (userSnapshot.exists()) {
          // Die channelId ist eine User-ID, speichere die Nachricht in der users-Collection
          this.saveMessageToUsers(userDocRef, message, messageInput);
        } else {
          // Die channelId ist keine User-ID, speichere die Nachricht in der channels-Collection
          this.saveMessageToChannels(message, messageInput);
        }
      })
      .catch((error: any) => {
        console.error('Error checking userId in Firestore:', error);
      });
  }
  
  // Speichert die Nachricht in der users-Collection
  private saveMessageToUsers(userDocRef: any, message: any, messageInput: HTMLTextAreaElement): void {
    const messagesRef = collection(this.firestore, `users/${userDocRef.id}/messages`);
    addDoc(messagesRef, message)
      .then(() => {
        this.clearMessageInputAndScroll(messageInput);
        console.log('Message saved to users successfully');
      })
      .catch((error) => {
        console.error('Error saving message to users:', error);
      });
  }
  
  // Speichert die Nachricht in der channels-Collection
  private saveMessageToChannels(message: any, messageInput: HTMLTextAreaElement): void {
    const messagesRef = collection(this.firestore, `channels/${this.channelId}/messages`);
    addDoc(messagesRef, message)
      .then(() => {
        this.clearMessageInputAndScroll(messageInput);
        console.log('Message saved to channels successfully');
      })
      .catch((error) => {
        console.error('Error saving message to channels:', error);
      });
  }
  
  // Leert das Nachrichtenfeld und scrollt nach unten
  private clearMessageInputAndScroll(messageInput: HTMLTextAreaElement): void {
    messageInput.value = '';  // Textarea leeren
    this.scrollToBottom();    // Nach unten scrollen
  }

  // 2. Nachricht vorbereiten
  prepareMessage(messageText: string) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    return {
      text: messageText,
      userName: this.user?.name || 'Unknown User',  // Verwende this.user.name
      userId: this.user?.id || 'Unknown UserId',    // Verwende this.user.id
      timestamp: Timestamp.fromDate(now),
      time: formattedTime,
      receivinguserId: this.channelId  // channelId als Empfangsuser verwenden
    };
  }
  getReceivingUserId(): string | null {
    const receivingUserId = this.route.snapshot.queryParams['receiverId']; // Oder 'params', je nach URL-Struktur
    if (receivingUserId) {
      console.log('Empfänger-ID aus der URL:', receivingUserId);
      return receivingUserId;
    } else {
      console.log('Keine Empfänger-ID in der URL gefunden.');
      return null;
    }
  }

  getReceivingUserIdFromUrl(): string | null {
    const receivingUserId = this.route.snapshot.paramMap.get('id');  // Oder verwende queryParams, wenn es sich um eine Query handelt
    if (receivingUserId) {
      console.log('Extracted receiving user ID:', receivingUserId);
      return receivingUserId;
    } else {
      console.error('Receiving user ID is not present in the URL');
      return null;
    }
  }

  // 3. Nachricht an Firestore senden
  sendMessageToFirestore(message: any): Promise<void> {
    console.log('Attempting to send message to channel:', this.channelId);
    return this.fireService.addMessageToFirestore(this.channelId, message);
  }

  // 4. Überprüfung der Nachrichteneingabe
  validateMessageInput(messageText: string): boolean {
    return messageText.trim() !== '' && !!this.channelId;
  }

  handleKeyDown(event: KeyboardEvent, messageInput: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {  // Prüfe, ob Enter gedrückt wurde (ohne Shift für Zeilenumbruch)
      event.preventDefault();  // Verhindere den Standard-Enter-Verhalten (z. B. Zeilenumbruch)
      this.sendMessage(messageInput.value);
    }
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
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

}
