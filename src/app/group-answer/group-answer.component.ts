import { Component, inject, OnInit } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { Firestore } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { collection, doc, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-group-answer',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './group-answer.component.html',
  styleUrl: './group-answer.component.scss'
})
export class GroupAnswerComponent implements OnInit {
  groupId: string | null = null;
  messageText: string = ''; // Hier wird der Nachrichtentext gespeichert
  groupName: string = ''; // Hier wird der Name der Gruppe gespeichert
  answerChat:string = ''; //Hier werden die Antworten stehen!
  userName: string = '';
  time: string = '';
  firestore: Firestore = inject(Firestore);
  channels$: Observable<any[]>;

  constructor(private route: ActivatedRoute) {
    // Erstelle die Referenz zur 'channels'-Sammlung
    const channelsCollection = collection(this.firestore, 'channels');

    // Hole die Daten aus der Sammlung und konvertiere sie in ein Observable
    this.channels$ = from(getDocs(channelsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    );
  }

  ngOnInit(): void {
    // Hole die groupId aus der URL
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
      if (this.groupId) {
        this.fetchChannelsAndMessages();
      }
    });
    // this.test();
  }

  async fetchChannelsAndMessages() {
    try {
      const channels = await this.fetchChannels();
      if (channels && channels.length > 0) {
        for (const channel of channels) {
          if (channel.id) {
            const messages = await this.fetchMessagesForChannel(channel.id);
            const matchingMessage = this.findMatchingMessage(messages);
            if (matchingMessage) {
              this.processMatchingMessage(matchingMessage, channel);
              return;
            }
          }
        }
        console.log('Keine passende Nachricht gefunden.');
      } else {
        console.log('Keine Kanäle gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Kanäle oder Nachrichten:', error);
    }
  }

  async fetchChannels() {
    try {
      // Hole alle Kanäle
      return await this.channels$.toPromise();
    } catch (error) {
      // console.error('Fehler beim Abrufen der Kanäle:', error);
      return [];
    }
  }

  async fetchMessagesForChannel(channelId: string) {
    try {
      const messagesCollection = collection(this.firestore, `channels/${channelId}/messages`);
      const messagesSnapshot = await getDocs(messagesCollection);
      return messagesSnapshot.docs.map(doc => ({
        ...doc.data() as { text: string, id: string, userName: string, time: string }, // Typen sicherstellen
        id: doc.id
      }));
    } catch (error) {
      // console.error('Fehler beim Abrufen der Nachrichten:', error);
      return [];
    }
  }

  findMatchingMessage(messages: any[]) {
    return messages.find(message => message.id === this.groupId);
  }

  processMatchingMessage(matchingMessage: any, channel: any) {
    console.log(`Nachricht gefunden:`, matchingMessage); // Hier siehst du den Inhalt in der Konsole

    // Kürze die Zeit auf Stunden und Minuten
    const timeParts = matchingMessage.time.split(':');
    this.time = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;

    // Setzen der Werte
    this.groupName = channel.name;
    this.messageText = matchingMessage.text;  // Nachrichtentext zuweisen
    this.userName = matchingMessage.userName;
  }

// async test(){
//   const channelsCollectionRef = collection(this.firestore, 'channels');
//   const channelsSnapshot = await getDocs(channelsCollectionRef);
//   channelsSnapshot.forEach(doc => {
//     console.log('ID:', doc.id);
//     console.log('Daten:', doc.data());
//   });
// }

}
