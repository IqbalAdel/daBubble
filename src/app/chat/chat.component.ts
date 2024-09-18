import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription,Observable  } from 'rxjs';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service'; // Sicherstellen, dass der Import korrekt ist
import { addDoc, arrayUnion, collection, doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';

export interface ChatMessage {
  text: string;
  timestamp: Timestamp;
  time: string;
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
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') messageInputRef!: ElementRef;

  channelId!: string;
  receiverUserId: string | null = "";
  messages: any[] = [];
  messageIds: string[] = [];
  answerId!: string;
  placeholderText: string = 'Nachricht an #Gruppenname';
  user: User | null = null;
  receivingUserId: string | null = null;
  private messagesSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;
  userService: UserService; // Sicherstellen, dass userService in der Klasse deklariert ist
  userName!: string;
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];

  constructor(private fireService: FirebaseService, private route: ActivatedRoute, userService: UserService, private firestore: Firestore, private router: Router) {
    this.userService = userService; // Initialisiere userService

  }

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUser(); // Die Methode laden, die den Benutzer lädt
    // Beobachten Sie Änderungen in den URL-Parametern
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id']; // ID aus der URL (z.B. Kanal- oder Benutzer-ID)
      this.answerId = params['answerId']; // answerId aus der URL
  
      if (this.answerId) {
        // Wenn eine answerId in der URL vorhanden ist, setze den Placeholder auf "Antworten"
        this.placeholderText = 'Antworten';
        console.log('meine answer Id',this.answerId);
      } else if (id) {
        // Wenn keine answerId vorhanden ist, lade die Daten basierend auf der ID (z.B. Kanal oder Benutzer)
        this.channelId = id;

        // this.loadDataBasedOnId(id);
        // this.setupMessageListener(id);
        // this.getReceivingUserIdFromUrl();
        // this.checkIdInUrlAndDatabase();
        this.giveTheIdFromMessages();
      } else if(this.router.url === '/main/new-message'){
      }
    });
  }


  //  -------- Kernfuntionen (4) --------
  
  sendMessage(messageText: string): void {
    if (!this.user) {
      return;
    }

    if(this.getReceivingUserIdFromUrl()){
      this.receiverUserId = this.getReceivingUserIdFromUrl();
      if (!this.receiverUserId) {
        return;
      }
    }
  
  
    this.sendMessageToUser(messageText, this.receiverUserId!);
    
    const messageInput = this.messageInputRef.nativeElement;
    const message = {
      text: messageText,
      timestamp: Timestamp.now(),
      userName: this.userName || 'Gast',
      userId: this.user.id,
      receivingUserId: this.receiverUserId,
      time: new Date().toLocaleTimeString(),
      chats:[],
      isRead:false
    };
    if (this.channelId === this.receiverUserId) {
      this.saveMessageToUserChats(this.receiverUserId, message);
    }
    
    this.checkIfUserAndSendMessage(message, messageInput);
    this.clearMessageInputAndScroll(messageInput);
    this.searchmessagesId();
  }

  sendMessageToUser(messageText: string, receivingUserId: string): void {
    if (!this.user) {
      return;
    }
  
    const chatId = this.fireService.createChatId(this.user.id, receivingUserId); // Chat-ID erstellen
    // console.log('Chat ID:', chatId);  // Debugging: Chat-ID ausgeben
  
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
  }

  private async saveMessageToUserChats(userId: string, message: any): Promise<void> {
    try {
      // Referenz auf das Dokument in der 'users/idMessages/id' Collection
      const userMessagesDocRef = doc(this.firestore, `users/${userId}/messages/${userId}`);
  
      // Dokument aktualisieren, um die Nachricht im `chats` Array hinzuzufügen
      await updateDoc(userMessagesDocRef, {
        chats: arrayUnion(message)  // Füge die Nachricht zum `chats` Array hinzu
      });  
    } catch (error) {
    }
  }
    
  //  Überprüft, ob die channelId eine User-ID ist und speichert entsprechend
  private checkIfUserAndSendMessage(message: any, messageInput: HTMLTextAreaElement): void {
    const userDocRef = doc(this.firestore, 'users', this.channelId);
  
    getDoc(userDocRef)
      .then((userSnapshot) => {
        if (this.answerId) {
          // Wenn eine answerId in der URL vorhanden ist, setze den Placeholder auf "Antworten"
          this.placeholderText = 'Antworten';
          console.log('meine answer Id',this.answerId);}
        if (userSnapshot.exists()) {
          // Die channelId ist eine User-ID, speichere die Nachricht in der users-Collection
        } else {
          // Die channelId ist keine User-ID, speichere die Nachricht in der channels-Collection
          this.saveMessageToChannels(message, messageInput);
        }
      })
      .catch((error: any) => {
      });
  }


  //  ----------- Bisher nicht verwendete Funktionen --------

  private saveMessageToAnswers(answerId: string, message: any): void {
    const answerDocRef = doc(this.firestore, `channels/${answerId}/messages`, 'chats'); // Angenommener Pfad
    updateDoc(answerDocRef, {
      chats: arrayUnion(message)  // Füge die Nachricht zum `chats` Array hinzu
    })
      .then(() => {
        console.log('Message saved to answers successfully');
      })
      .catch((error) => {
        console.error('Error saving message to answers:', error);
      });
  
  }

  private checkMessageIdAndSave(message: any, messageInput: HTMLTextAreaElement): void {
    const messagesCollectionRef = collection(this.firestore, 'channels', this.channelId, 'messages');
  
    // Nachrichten mit ihren IDs abrufen
    collectionData(messagesCollectionRef, { idField: 'id' }).subscribe((messages: any[]) => {
      const matchingMessage = messages.find(msg => msg.id === this.channelId);
  
      if (matchingMessage) {
        // Wenn die Nachricht mit derselben ID existiert, füge die neue Nachricht zum Array 'chats' hinzu
        const messageDocRef = doc(this.firestore, 'channels', this.channelId, 'messages', matchingMessage.id);
        
        updateDoc(messageDocRef, {
          chats: arrayUnion(message) // Nachricht dem Array 'chats' hinzufügen
        }).then(() => {
          this.clearMessageInputAndScroll(messageInput);
        }).catch((error) => {
        });
  
      } else {
        // Wenn keine Nachricht gefunden wird, speichere sie als neue Nachricht
        this.saveMessageToChannels(message, messageInput);
      }
    }, (error) => {
    });
  }


  // ----------  Hilfesfunktionen --------------

  private setupMessageListener(chatId: string): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }  
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);  
    this.messagesSubscription = collectionData(messagesRef, { idField: 'id' })
      .subscribe(
        (messages: any[]) => {
          this.messages = messages;
          // Bei neuer Nachricht Blinken aktivieren
          // messages.forEach(message => this.receiveMessage(message));
        },
        (error: any) => {
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
          const answersChatId = await getDoc(this.fireService.getChannelDocRef(id))
          this.placeholderText = 'Antworten';
          
        }
      }
    } catch (error) {
    }
  }

  private checkIdInUrlAndDatabase(): void {
    const urlId = this.getIdFromUrl();
    // console.log('ID aus der URL:', urlId);
    this.fireService.getChannelsMessages(this.channelId).subscribe({
      next: (messages) => {
        const matchingMessage = messages.find((message) => message.receivingUserId === urlId);
        
        if (matchingMessage) {
        } else {
        }
      },
      error: (error) => {
      }
    });
  }

  async giveTheIdFromMessages() {
    const messagesCollectionRef = collection(this.firestore, 'channels', this.channelId, 'messages');

    collectionData(messagesCollectionRef, { idField: 'id' }).subscribe((messages: any[]) => {
      this.messageIds = messages.map(message => message.id); // IDs in die Property speichern
    }, (error: any) => {
    });
  }
  
  // Speichert die Nachricht in der channels-Collection
  private saveMessageToChannels(message: any, messageInput: HTMLTextAreaElement): void {
    const messagesRef = collection(this.firestore, `channels/${this.channelId}/messages`);
    addDoc(messagesRef, message)
      .then(() => {
        this.clearMessageInputAndScroll(messageInput);
      })
      .catch((error) => {
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
      receivinguserId: this.channelId,  // channelId als Empfangsuser verwenden
      chats:[]
    };
  }

  

  // 3. Nachricht an Firestore senden
  sendMessageToFirestore(message: any): Promise<void> {
    // console.log('Attempting to send message to channel:', this.channelId);
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

  private getIdFromUrl(): string | null {
    return this.route.snapshot.paramMap.get('id');  // 'id' ist der URL-Parameter-Name
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


  getUserIdFromUrl(): string | null {
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      console.log('Benutzer-ID aus der URL:', userId);
      return userId;
    } else {
      return null;
    }
  }

  searchmessagesId(){
    const channelId = this.channelId;
    this.fireService.getChannelsMessages(channelId).subscribe({
      next: (messages) => {
        // Hier erhältst du die Nachrichten
        messages.forEach(message => {
        });
      },
      error: (error) => {
      }
    });
  }


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

  async loadCurrentUser() {
    try {
      const uid = await this.fireService.getCurrentUserUid();
      // console.log('Current user UID:', uid);  // Debugging-Ausgabe für UID
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        // console.log('Loaded user:', this.user);  // Debugging-Ausgabe für Benutzerobjekt
        if (this.user) {
          this.userName = this.user.name;  // Setze den Benutzernamen, falls erforderlich
        }
      } else {
        // console.error('No UID retrieved');
      }
    } catch (error) {
      // console.error('Error fetching user data:', error);
    }
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
}
