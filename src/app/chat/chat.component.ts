import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service'; // Sicherstellen, dass der Import korrekt ist
import { addDoc, arrayUnion, collection, doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { GroupChatComponent } from '../group-chat/group-chat.component';

export interface ChatMessage {
  text: string;
  timestamp: Timestamp;
  time: any;
  userName: string;
  userId: string;
  receivingUserId: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']  // styleUrl zu styleUrls geändert, wenn das notwendig ist
})
export class ChatComponent implements OnInit{
  @ViewChild('messageInput') messageInputRef!: ElementRef;
  @Output() notify: EventEmitter<void> = new EventEmitter<void>();
  imgTextarea = ['assets/add.svg', 'assets/img/smiley/sentiment_satisfied.svg', 'assets/img/smiley/alternate_email.svg', 'assets/img/smiley/send.svg'];
  channelId!: string;
  receiverUserId: string | null = "";
  messages: any[] = [];
  messageIds: string[] = [];
  @Input() groupId: string | null = null;
  @Input() answerId: string | null = null; placeholderText: string = 'Nachricht an #Gruppenname';
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
      const id = params['id']; // ID aus der URL (z.B. Kanal- oder Benutzer-ID)
      this.answerId = params['answerId']; // answerId aus der URL
      
      console.log('URL-Parameter:', params); // Debugging-Ausgabe für URL-Parameter
  
      // Sicherstellen, dass der Benutzer geladen wird
      this.loadCurrentUser();

      
      if (this.answerId) {
        // Wenn eine answerId in der URL vorhanden ist, setze den Placeholder auf "Antworten"
        this.placeholderText = 'Antworten';
        console.log('meine answer Id', this.answerId);
      } else if (id) {
        // Wenn keine answerId vorhanden ist, lade die Daten basierend auf der ID (z.B. Kanal oder Benutzer)
        this.channelId = id;
        console.log('meine channelId', this.channelId); // Debugging-Ausgabe
  
        // Überprüfen, ob `channelId` richtig gesetzt ist
        if (this.channelId) {
          this.loadDataBasedOnId(id);
        } else {
          console.error('channelId ist nicht definiert nach dem Setzen der ID:', id);
        }
      }
    });
  }



  async loadCurrentUser() {
    try {
      const uid = await this.fireService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.userName = this.user.name;  // Setze den Benutzernamen, falls erforderlich
        }

      } else {
      }
    } catch (error) {
    }
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
        }
      }
    } catch (error) {
    }
  }

  sendMessageToUser(messageText: string, receivingUserId: string): void {
    if (!this.user) {
      return;
    }
    const chatId = this.fireService.createChatId(this.user.id, receivingUserId); // Chat-ID erstellen
    const message = {
      text: messageText,
      timestamp: Timestamp.now(),
      userName: this.user.name,
      userId: this.user.id,
      receivingUserId: receivingUserId,
      time: new Date().toLocaleTimeString(),
      isRead: false
    };
    // Nachricht in der Firestore-Collection für diesen Chat speichern
    if (chatId) {
      const chatDocRef = doc(this.firestore, 'chats', chatId);
      addDoc(collection(chatDocRef, 'messages'), message)
        .then(() => console.log('Message sent successfully'))
        .catch(error => console.error('Error sending message:', error));
    } else {
    }
    this.clearMessageInputAndScroll(this.messageInputRef.nativeElement);
  }



  async giveTheIdFromMessages() {
    const messagesCollectionRef = collection(this.firestore, 'channels', this.channelId, 'messages');

    collectionData(messagesCollectionRef, { idField: 'id' }).subscribe((messages: any[]) => {
      this.messageIds = messages.map(message => message.id); // IDs in die Property speichern
    }, (error: any) => {
    });
  }

  sendMessage(messageText: string): void {
  
    if (!this.user) {
      console.log('Kein Benutzer vorhanden');
      return;
    }

    if (!this.isMessageValid(messageText)) {
      console.log('Nachricht ist nicht gültig');
      return; // Verhindere das Senden einer leeren Nachricht
    }

    const receivingUserId = this.getReceivingUserIdFromUrl() || this.answerId;
    if (!receivingUserId) {
      console.log('Empfänger-ID nicht vorhanden');
      return;
    }
    // Nachricht erstellen durch Aufruf der neuen Methode
    const message = this.createMessage(messageText, receivingUserId);
    // Wenn eine answerId vorhanden ist, speichere die Nachricht auch dort
    if (this.answerId) {
      this.saveMessageToAnswers(this.answerId, message);  // Speichert das gesamte message-Objekt
      console.log('Message saved to answers');
    }
    this.sendMessageToUser(message.text, receivingUserId); // Nachricht-Objekt statt nur Text
    this.checkIfUserAndSendMessage(message, this.messageInputRef.nativeElement);
    this.notify.emit()
}
  private createMessage(messageText: string, receivingUserId: string): any {
    if (!this.user) {
      console.error('User is not defined');
      return null; // oder werfe einen Fehler, je nach Anforderung
    }
    return {
      text: messageText,
      timestamp: Timestamp.now(),
      userName: this.userName || 'Gast',
      userId: this.user.id,
      receivingUserId: receivingUserId,
      time: new Date().toLocaleTimeString(),
      chats: [],
      isRead: false
    };
  }

  private async saveMessageToAnswers(answerId: string, message: any): Promise<void> {
    try {
      // Erstelle eine Referenz auf das Dokument `answerId` in der Subcollection `messages` der `channels` Sammlung
      const chatDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${answerId}`);
      // Dokument aktualisieren, um die Nachricht im `chats` Array hinzuzufügen
      await updateDoc(chatDocRef, {
        chats: arrayUnion(message)  // Füge das gesamte `message`-Objekt zum `chats` Array hinzu
      });
    } catch (error) {
    }
    this.clearMessageInputAndScroll(this.messageInputRef.nativeElement);
  }

  // Überprüft, ob die channelId eine User-ID ist und speichert entsprechend
  private async checkIfUserAndSendMessage(message: any, messageInput: HTMLTextAreaElement): Promise<void> {
    try {
      if (!this.channelId) {
        throw new Error('channelId ist nicht definiert');
      }
  
      const userDocRef = doc(this.firestore, 'users', this.channelId);
  
      const userSnapshot = await getDoc(userDocRef);
  
      if (userSnapshot.exists()) {
        // Die channelId ist eine User-ID, speichere die Nachricht in der users-Collection
        // Füge hier den Code zum Speichern der Nachricht hinzu, wenn es sich um eine User-ID handelt
        console.log('Benutzer existiert. Nachricht wird in der users-Collection gespeichert.');
      } else {
        // Die channelId ist keine User-ID, speichere die Nachricht in der channels-Collection
        await this.saveMessageToChannels(message, messageInput);
      }
    } catch (error) {
      // console.error('Fehler beim Überprüfen und Speichern der Nachricht:', error);
    }
  }

  // Speichert die Nachricht in der channels-Collection
  async saveMessageToChannels(message: any, messageInput: HTMLTextAreaElement): Promise<void> {
    const messagesRef = collection(this.firestore, `channels/${this.channelId}/messages`);
    addDoc(messagesRef, message)
      .then(() => {
        this.clearMessageInputAndScroll(messageInput);
      })
      .catch((error) => {
      });
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
      receivinguserId: this.channelId,  // channelId als Empfangsuser verwenden
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
    const receivingUserId = this.route.snapshot.paramMap.get('id');  // Falls nötig, ändere 'id' auf den richtigen Parametername
    return receivingUserId;
  }

  // 3. Nachricht an Firestore senden
  async sendMessageToFirestore(message: any): Promise<void> {
    // console.log('Attempting to send message to channel:', this.channelId);
    return this.fireService.addMessageToFirestore(this.channelId, message).then(() => {
      console.log('confirmed success')
    }).catch((error) => {
      console.log('failed to send message to firestore',error)
    });
  }

  // 4. Überprüfung der Nachrichteneingabe
  validateMessageInput(messageText: string): boolean {
    return messageText.trim() !== '' && !!this.channelId;
  }

  handleKeyDown(event: KeyboardEvent, messageInput: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {  // Prüfe, ob Enter gedrückt wurde (ohne Shift für Zeilenumbruch)
      event.preventDefault();  // Verhindere das Standard-Enter-Verhalten (z. B. Zeilenumbruch)

      const messageText = messageInput.value.trim(); // Entferne Leerzeichen am Anfang und Ende
      // this.clearMessageInputAndScroll(messageInput);
      if (messageText.length > 0) {  // Sende nur, wenn die Nachricht nicht leer ist
        this.sendMessage(messageText);
      }
    }

  }

  private isMessageValid(messageText: string): boolean {
    const trimmedMessageText = messageText.trim();
    return trimmedMessageText.length > 0;
  }

  // Leert das Nachrichtenfeld und scrollt nach unten
  private clearMessageInputAndScroll(messageInput: HTMLTextAreaElement): void {
    messageInput.value = '';  // Textarea leeren
    console.log('nachrichht solle gelöscht werden ');
  }

  changeAdd(isHover: boolean) {
    this.imgTextarea[0] = isHover ? 'assets/add-hover-blue.svg' : 'assets/add.svg';
  }

  addSmiley(isHover: boolean) {
    this.imgTextarea[1] = isHover ? 'assets/img/smiley/sentiment_satisfied-blue.svg' : 'assets/img/smiley/sentiment_satisfied.svg';
  }
  addEmailContact(isHover: boolean) {
    this.imgTextarea[2] = isHover ? 'assets/img/smiley/alternate_email-blue.svg' : 'assets/img/smiley/alternate_email.svg';
  }
  sendNews(isHover: boolean) {
    this.imgTextarea[3] = isHover ? 'assets/img/smiley/send-light-blue.svg' : 'assets/img/smiley/send.svg';
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

}
