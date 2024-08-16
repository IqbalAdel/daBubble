import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  constructor(private fireService: FirebaseService, private route: ActivatedRoute) { }
  placeholderText: string = 'Nachricht an #Gruppenname';


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']; // ID aus der URL
      if (id) {
        this.loadDataBasedOnId(id);
      }
    });
  }

  private loadDataBasedOnId(id: string): void {
    // Versuche zuerst, einen Channel zu laden
    this.fireService.getChannelById(id).then(channel => {
      if (channel) {
        this.placeholderText = `Nachricht an #${channel.name}`;
      } else {
        // Wenn kein Channel gefunden wird, versuche, einen Benutzer zu laden
        this.fireService.getUserById(id).then(user => {
          if (user) {
            this.placeholderText = `Nachricht an ${user.name}`;
          } else {
            this.placeholderText = 'Nachricht an #Gruppenname';
          }
        });
      }
    });
  }
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png']

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
    if (message.trim()) {
      // Nachricht in Firebase Firestore speichern
      this.fireService.addMessageToFirestore(message).then(() => {
        console.log('Message sent:', message);
        // Textarea leeren
        messageInput.value = '';
      }).catch((error) => {
        console.error('Error sending message:', error);
      });
    }
  
  }

  handleKeyDown(event: KeyboardEvent, messageInput: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {  // Prüfe, ob Enter gedrückt wurde (ohne Shift für Zeilenumbruch)
      event.preventDefault();  // Verhindere den Standard-Enter-Verhalten (z. B. Zeilenumbruch)
      this.sendMessage(messageInput);
    }
  }
}
