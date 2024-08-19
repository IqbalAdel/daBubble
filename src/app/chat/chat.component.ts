import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  channelId!: string;
  messages: any[] = [];
  placeholderText: string = 'Nachricht an #Gruppenname';

  private messagesSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(private fireService: FirebaseService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Beobachten Sie Änderungen in den URL-Parametern
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id']; // ID aus der URL
      if (id) {
        this.channelId = id;
        this.loadDataBasedOnId(id);
        this.setupMessageListener(id);
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

  getTimeForMessage(timestamp: Date): string {
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} Uhr`;
  }

  private async setupMessageListener(channelId: string): Promise<void> {
    // Falls ein vorheriger Listener vorhanden ist, aufheben
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    try {
      // Nachrichten abonnieren
      const messagesPromise = this.fireService.getChannelsMessages(channelId);
      const messages = await messagesPromise;
      this.messages = messages;
      console.log('Messages updated:', this.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
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
    const message = messageInput.value;

    if (message.trim() && this.channelId) {
      console.log('Attempting to send message to channel:', this.channelId);

      this.fireService.addMessageToFirestore(this.channelId, message).then(() => {
        console.log('Message successfully sent and saved in Firestore:', message);
        messageInput.value = '';  // Textarea leeren
      }).catch((error) => {
        console.error('Error sending message to Firestore:', error);
      });
    } else {
      console.log('Message is empty or channelId is not set, not sending.');
    }
  }

  handleKeyDown(event: KeyboardEvent, messageInput: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {  // Prüfe, ob Enter gedrückt wurde (ohne Shift für Zeilenumbruch)
      event.preventDefault();  // Verhindere den Standard-Enter-Verhalten (z. B. Zeilenumbruch)
      this.sendMessage(messageInput);
    }
  }
}
