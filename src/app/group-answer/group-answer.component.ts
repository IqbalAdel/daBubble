import { AfterViewInit, Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { Firestore } from '@angular/fire/firestore';
import { from, map, Observable, tap } from 'rxjs';
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../../models/user.class';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
interface Chat {
  messageId: string;
  smileys?: Smiley[];
}

interface Smiley {
  smiley: string;
  clickedBy: string[];
}

@Component({
  selector: 'app-group-answer',
  standalone: true,
  imports: [ChatComponent, CommonModule, PickerModule],
  templateUrl: './group-answer.component.html',
  styleUrl: './group-answer.component.scss'
})
export class GroupAnswerComponent implements OnInit, AfterViewInit {
  groupId: string | null = null;
  answerId: string | null = null;
  userProfilePicture: string = 'assets/img/default-avatar.png'; // Standardbild
  user: User | null = null;
  messageText: string = ''; // Nachrichtentext
  groupName: string = ''; // Gruppenname
  answerChats: any[] = []; // Antworttext
  userName: string = ''; // Benutzername
  time: string = ''; // Zeit
  firestore: Firestore = inject(Firestore);
  channels$: Observable<any[]>;
  loggedInUserName!: string;
  imgClose: string = 'assets/img/close_default.svg';
  messages: { id:string; text: string; timestamp: string; time: string; userName: string; chats: string}[] = [];
  @ViewChild('scrollerContainer', { static: false }) scrollContainer: ElementRef | undefined;
  @Output() threadClosed: EventEmitter<void> = new EventEmitter<void>();
  imgSrc = ['assets/img/smiley/add_reaction.svg', 'assets/img/smiley/comment.svg', 'assets/person_add.svg', 'assets/more_vert.svg'];
  emojiPickerVisible: boolean = false; // Variable zum Anzeigen/Ausblenden des Emoji-Pickers
  chatIndex: number = 0;
  chat = {
    messageId: '12345',  // Beispielhafte Nachricht-ID, dies muss dynamisch gesetzt werden
    userName: 'JohnDoe'
  };
  

  constructor(private route: ActivatedRoute, public userService: UserService,  private firebaseService: FirebaseService, private router: Router) {
    const channelsCollection = collection(this.firestore, 'channels');

    // Daten aus der 'channels'-Sammlung holen und in Observable umwandeln
    this.channels$ = from(getDocs(channelsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    );



  }

  async ngOnInit(): Promise<void> {
    this.userService.setThreadStatus(true);
    // Überwache die URL-Parameteränderungen
    this.route.paramMap.subscribe(async params => {
      // Extrahiere groupId und answerId aus der URL
      this.groupId = this.route.snapshot.parent?.paramMap.get('id') || null;
      this.answerId = params.get('answerId') || null;
  
      // Stelle sicher, dass der Benutzername geladen wird
      await this.loggedInUser();
  
      // Zugriff auf loggedInUserName nach sicherer Initialisierung
      if (this.groupId && this.answerId) {
        await this.fetchChannelsAndMessages();
        await this.fetchAnswerChats(this.answerId);
      }
  
      // Protokolliere den Benutzernamen für Debugging
      console.log('loggedInUserName:', this.loggedInUserName);
      console.log('start vom answer')
    });


  }

  ngOnDestroy(): void {
    if (this.unsubscribeFromAnswerChats) {
      this.unsubscribeFromAnswerChats();
    }
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  async loggedInUser() {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; // Setze den Namen des eingeloggten Benutzers
          this.userProfilePicture = this.user.img || 'assets/img/default-avatar.png'; // Setze das Profilbild oder ein Standardbild
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
    
  }
  private unsubscribeFromAnswerChats: (() => void) | undefined;

  fetchAnswerChats(answerId: string) {
    try {
      // Referenz zum Dokument
      const answerDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${answerId}`);
      
      // Setze den Echtzeit-Listener
      if (this.unsubscribeFromAnswerChats) {
        this.unsubscribeFromAnswerChats(); // Falls bereits ein Listener existiert, abbestellen
      }
      
      this.unsubscribeFromAnswerChats = onSnapshot(answerDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const answerData = docSnapshot.data();
          this.answerChats = answerData['chats'] || [];
          
          // Formatierung der Zeiten in den Chats
          this.answerChats = this.answerChats.map(chat => ({
            ...chat,
            time: this.formatTime(chat.time)
          }));
          
          console.log('Antworten geladen:', this.answerChats);
        } else {
          console.log('Keine Antworten gefunden für answerId:', answerId);
        }
      });
    } catch (error) {
      console.error('Fehler beim Laden der Antworten:', error);
    }
  }

  // Methode zum Holen der Channels und Messages
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

  // Kanäle abrufen
  async fetchChannels() {
    try {
      return await this.channels$.toPromise();
    } catch (error) {
      return [];
    }
  }

  // Nachrichten für einen Kanal abrufen
  async fetchMessagesForChannel(channelId: string) {
    try {
      const messagesCollection = collection(this.firestore, `channels/${channelId}/messages`);
      const messagesSnapshot = await getDocs(messagesCollection);
      return messagesSnapshot.docs.map(doc => ({
        ...doc.data() as { text: string, id: string, userName: string, time: string },
        id: doc.id
      }));
    } catch (error) {
      return [];
    }
  }

  // Nachricht finden, die zur AnswerId passt
  findMatchingMessage(messages: any[]) {
    return messages.find(message => message.id === this.answerId);
  }

  // Nachricht verarbeiten und Daten setzen
  processMatchingMessage(matchingMessage: any, channel: any) {
    console.log('Nachricht gefunden:', matchingMessage);

    const timeParts = matchingMessage.time.split(':');
    this.time = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;

    this.groupName = channel.name;
    this.messageText = matchingMessage.text;
    this.userName = matchingMessage.userName;
  }


  // Methode zum Extrahieren von GroupId und AnswerId
  giveGroupIdAndAnswerID() {
    // GroupId von der Elternroute holen
    this.route.parent?.paramMap.subscribe(parentParams => {
      this.groupId = parentParams.get('id'); // Gruppen-ID aus der Elternroute
      console.log('Group ID:', this.groupId);
      
      // Wenn GroupId verfügbar ist, Channels und Messages abrufen
      if (this.groupId) {
        this.fetchChannelsAndMessages();
      }
    });

    // AnswerId aus der aktuellen Route holen
    this.route.paramMap.subscribe(params => {
      this.answerId = params.get('answerId'); // Antwort-ID aus der aktuellen Route
      // console.log('Answer ID:', this.answerId);
    });
  }

  getAnswersForChannel(channelId: string): Observable<any[]> {
    const messagesCollection = collection(this.firestore, `channels/${channelId}/messages`);
    return from(getDocs(messagesCollection)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      tap((messages) => {
        // Hier wird das Ergebnis geloggt
        console.log('Abgerufene Nachrichten für Channel:', channelId, messages);
      })
    );
  }

  scrollToBottom(): void {
    if(this.scrollContainer){
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Scroll error:', err);
      }
    }
    else{
      console.log('fail')
    }
  }

  ngAfterViewInit(): void {
    this.observeMutations();
  }

  observeMutations(): void {
    if(this.scrollContainer){
      const config = { childList: true, subtree: true };
      const observer = new MutationObserver(() => {
        this.scrollToBottom();
      });
  
      observer.observe(this.scrollContainer.nativeElement, config);
    }
    else{
      console.log('no container')
    }
  }

  closeAnswer(){
    this.userService.showGroupAnswer = false;
    this.userService.setThreadStatus(false);
    this.router.navigate([`/main/group-chat/${this.groupId}`]);
    this.threadClosed.emit()

  }

  changeImageMoreVert(isHover: boolean) {
    this.imgSrc[3] = isHover ? 'assets/more_vert_hover.svg' : 'assets/more_vert.svg';
  }
  
  changeImageSmiley(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/img/smiley/add_reaction-blue.svg' : 'assets/img/smiley/add_reaction.svg';
  }

  openSmiley() {
    this.emojiPickerVisible = !this.emojiPickerVisible; // Emoji-Picker umschalten
  }

  async addEmoji(event: any, messageId: string, chatIndex: number) {
    const emoji = event.emoji.native;  // Das ausgewählte Emoji
    const groupId = this.groupId; // Die ID des Channels oder der Gruppe

    try {
        // Referenz auf das spezifische Dokument in der Firebase-Datenbank
        const messageDocRef = doc(this.firestore, `channels/${groupId}/messages/${messageId}`);
    
        // Hole das Dokument (Nachricht) aus Firebase
        const messageDocSnapshot = await getDoc(messageDocRef);
    
        if (messageDocSnapshot.exists()) {
            const messageData = messageDocSnapshot.data();
            console.log('Nachrichtendaten:', messageData); // Debugging: Zeige die abgerufenen Daten an
            
            const chatsArray = messageData['chats'] || [];
    
            if (chatsArray[chatIndex]) {
                const chat = chatsArray[chatIndex];
                const smileysArray = chat['smileys'] || [];
    
                const existingSmileyIndex = smileysArray.findIndex((s: { smiley: string }) => s.smiley === emoji);
    
                if (existingSmileyIndex > -1) {
                    const clickedByArray = smileysArray[existingSmileyIndex].clickedBy;
                    const userIndex = clickedByArray.indexOf(this.loggedInUserName);
    
                    if (userIndex > -1) {
                        clickedByArray.splice(userIndex, 1);
                        if (clickedByArray.length === 0) {
                            smileysArray.splice(existingSmileyIndex, 1);
                        }
                    } else {
                        clickedByArray.push(this.loggedInUserName);
                    }
                } else {
                    smileysArray.push({
                        smiley: emoji,
                        clickedBy: [this.loggedInUserName],
                    });
                }
    
                chatsArray[chatIndex]['smileys'] = smileysArray;
    
                // Aktualisiere das Dokument in Firebase mit dem neuen `chats`-Array
                await updateDoc(messageDocRef, {
                    chats: chatsArray,
                });
    
                console.log('Smiley erfolgreich im Chat aktualisiert:', smileysArray);
            } else {
                console.error('Chat mit Index', chatIndex, 'nicht gefunden.');
            }
        } else {
            console.error('Nachricht nicht gefunden:', messageId);
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Smileys:', error);
    }
  
    // Emoji-Picker schließen nach Auswahl
    this.emojiPickerVisible = false;
}


  
  

}
