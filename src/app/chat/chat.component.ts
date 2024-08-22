import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service'; // Sicherstellen, dass der Import korrekt ist

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']  // styleUrl zu styleUrls geändert, wenn das notwendig ist
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  channelId!: string;
  messages: any[] = [];
  placeholderText: string = 'Nachricht an #Gruppenname';
  user: User | null = null;
  private messagesSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;
  userService: UserService; // Sicherstellen, dass userService in der Klasse deklariert ist
  userName!: string;

  constructor(private fireService: FirebaseService, private route: ActivatedRoute, userService: UserService) {
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

  async loadCurrentUser() { // Methode für das Laden des aktuellen Benutzers
    try {
      const uid = await this.fireService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid); // Hier userService verwenden
        this.user = this.userService.getUser(); // Hier userService verwenden
        if (this.user) {
          this.userName = this.user.name; // Setze den Benutzernamen, falls erforderlich
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  private setupMessageListener(channelId: string): void {
    // Falls ein vorheriger Listener vorhanden ist, aufheben
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    // Nachrichten abonnieren
    this.messagesSubscription = this.fireService.getChannelsMessages(channelId)
      .subscribe(
        (messages) => {
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

  getChannelIdFromUrl(): string {
    // Logik, um die Channel-ID aus der URL zu extrahieren.
    // Beispiel: Rückgabe der ID direkt oder über eine URL-Parsing-Methode.
    return 'exampleChannelId';
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

  sendMessage(messageInput: HTMLTextAreaElement): void {
    const messageText = messageInput.value;
    if (this.validateMessageInput(messageText)) {
      const message = this.prepareMessage(messageText);  // Nachricht vorbereiten
      const userId = this.getUserIdFromUrl();  // Holen der User ID aus der URL

      // Nachricht sowohl an die Kanäle als auch an die Chats des Benutzers senden
      Promise.all([
        this.sendMessageToChannelFirestore(message), // Nachricht in den Channel einfügen
        this.addMessageToUserChats(userId, message)  // Nachricht in den User Chats hinzufügen
      ])
        .then(() => {
          console.log('Message successfully sent and saved in Firestore:', message);
          messageInput.value = '';  // Textarea leeren
          this.scrollToBottom();    // Nach unten scrollen, wenn eine Nachricht erfolgreich gesendet wurde
        })
        .catch((error: any) => {
          console.error('Error sending message to Firestore:', error);
        });
    } else {
      console.log('Message is empty or channelId is not set, not sending.');
    }
  }

  // 2. Nachricht vorbereiten
  prepareMessage(messageText: string) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Nachrichtendaten für Firestore
    return {
      text: messageText,
      userName: this.user?.name || 'Unknown User',  // Verwende user.name oder 'Unknown User'
      userId: this.user?.id,  // Optional: UID des Benutzers, falls verfügbar
      timestamp: formattedDate,  // Datum speichern
      time: formattedTime  // Zeit speichern
    };
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
      this.sendMessage(messageInput);
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

  // Nachricht an die Channel-Sammlung senden
  sendMessageToChannelFirestore(message: any): Promise<void> {
    console.log('Attempting to send message to channel:', this.channelId);
    return this.fireService.addMessageToFirestore(this.channelId, message);
  }

  addMessageToUserChats(userId: string | null, message: any): Promise<void> {
    if (userId) {
      console.log('Attempting to add message to user chats:', userId);
      return this.fireService.addMessageToUserChats(userId, message);
    } else {
      return Promise.reject('No user ID available to add message to user chats.');
    }
  }
}
