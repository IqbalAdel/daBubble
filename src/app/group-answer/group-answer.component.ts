import { Component, inject, OnInit } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { Firestore } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { collection, getDocs } from 'firebase/firestore';

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
  firestore:Firestore = inject(Firestore)
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
        this.checkMessagesAndFetchChannelName();
      }
    });
  }

  async checkMessagesAndFetchChannelName() {
    try {
      // Hole alle Kanäle
      const channels = await this.channels$.toPromise();

      if (channels && channels.length > 0) {
        // Überprüfe, ob eine Nachricht die gleiche ID wie die URL-ID hat
        for (const channel of channels) {
          if (channel.id) {
            const messagesCollection = collection(this.firestore, `channels/${channel.id}/messages`);
            const messagesSnapshot = await getDocs(messagesCollection);
            const messages = messagesSnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            }));

            // Suche nach einer Nachricht mit der gleichen ID wie die URL-ID
            const matchingMessage = messages.find(message => message.id === this.groupId);

            if (matchingMessage) {
              console.log(`Nachricht mit ID ${this.groupId} gefunden!`);
              // console.log(`Kanalname: ${channel.name}`);
              this.groupName = channel.name;
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
}