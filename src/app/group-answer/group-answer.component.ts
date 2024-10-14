import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, inject, OnInit, Output, ViewChild } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
interface Chat {
  messageId: string;
  smileys?: Smiley[];
}

interface Smiley {
  smiley: string;
  clickedBy: string;
}

@Component({
  selector: 'app-group-answer',
  standalone: true,
  imports: [ChatComponent, CommonModule, PickerModule, FormsModule],
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
  editModeIndex: number | null = null; // Speichert den Index des zu bearbeitenden Chats
  chatText: string = '';  
  activeChatIndex: number | null = null; // Stellen Sie sicher, dass activeChatIndex definiert ist
  editedText: string = '';
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
    document.addEventListener('click', this.handleOutsideClick);

  }

  ngOnDestroy(): void {
    if (this.unsubscribeFromAnswerChats) {
      this.unsubscribeFromAnswerChats();
    }
    document.removeEventListener('click', this.handleOutsideClick);
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

  openSmiley(chatIndex: number): void {
    this.activeChatIndex = chatIndex;
    this.emojiPickerVisible = true; // Emoji-Picker anzeigen
  }

  async addEmoji(event: any, chatIndex: number) {
    const emoji = event.emoji.native;  // Das ausgewählte Emoji
    const answerId = this.answerId;    // Verwende die Antwort-ID (answerId) für die Gruppenantwort
    const loggedInUserName = this.loggedInUserName; // Der Benutzername des angemeldeten Nutzers
    try {
        const chat = this.answerChats[chatIndex];
        if (!chat) {
            console.error('Kein Chat-Objekt gefunden für den Index', chatIndex);
            return; // Beende die Funktion, wenn kein Chat vorhanden ist
        }
        let smileysArray: Smiley[] = chat['smileys'] || []; // Hier speichern wir direkt im Chat-Objekt
        const existingSmileyIndex = smileysArray.findIndex((s: Smiley) => s.smiley === emoji);

        if (existingSmileyIndex !== -1) {
            const clickedByUsers = smileysArray[existingSmileyIndex].clickedBy.split(',').map(user => user.trim());

            if (!clickedByUsers.includes(loggedInUserName)) {
                clickedByUsers.push(loggedInUserName);
            } else {
                const newClickedByUsers = clickedByUsers.filter(user => user !== loggedInUserName);
                smileysArray[existingSmileyIndex].clickedBy = newClickedByUsers.join(', '); // Aktualisiere die Benutzer

                if (newClickedByUsers.length === 0) {
                    smileysArray.splice(existingSmileyIndex, 1);
                }
            }
        } else {
            smileysArray.push({
                smiley: emoji,
                clickedBy: loggedInUserName // Starte mit dem aktuellen Benutzer
            });
        }

        chat['smileys'] = smileysArray;

        const messageDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${answerId}`);

        await updateDoc(messageDocRef, {
            chats: this.answerChats, // Hier bleibt das chats-Array unverändert, wir aktualisieren nur das spezifische Chat-Objekt
        });

    } catch (error) {
        console.error('Fehler beim Hinzufügen des Smileys:', error);
    }
    this.emojiPickerVisible = false;
}



handleOutsideClick = (event: MouseEvent) => {
  const emojiPicker = document.querySelector('.emoji-picker');
  if (emojiPicker && !emojiPicker.contains(event.target as Node)) {
    this.emojiPickerVisible = false;
  }
};

 @HostListener('document:click', ['$event'])
 onDocumentClick(event: MouseEvent): void {
   const target = event.target as HTMLElement;
   
   if (!target.closest('.emoji-mart') && !target.closest('.img-hover')) {
     this.emojiPickerVisible = false; // Emoji-Picker schließen
   }
 }
 countReactions(clickedBy: string): number {
  if (!clickedBy) return 0;

  const users = clickedBy.split(',');

  return users.filter(user => user.trim() !== '').length;
}
hasSmileys(chat: any): boolean {
  return chat.smileys && chat.smileys.some((s: Smiley) => s.smiley);
}

async toggleSmiley(chatIndex: number, smiley: Smiley) {
  try {
      const chat = this.getChatByIndex(chatIndex);
      if (!chat) return;

      let smileysArray = this.getSmileysArray(chat);
      const existingSmileyIndex = this.findSmileyIndex(smileysArray, smiley.smiley);

      if (existingSmileyIndex !== -1) {
          this.updateExistingSmiley(smileysArray, existingSmileyIndex, smiley.smiley);
      } else {
          this.addNewSmiley(smileysArray, smiley.smiley);
      }

      chat['smileys'] = smileysArray;
      await this.updateFirebase(chatIndex);

  } catch (error) {
      console.error('Fehler beim Aktualisieren des Smileys:', error);
  }
}
getChatByIndex(chatIndex: number) {
  const chat = this.answerChats[chatIndex];
  if (!chat) {
      console.error('Kein Chat-Objekt gefunden für den Index', chatIndex);
  }
  return chat;
}

getSmileysArray(chat: any): Smiley[] {
  return chat['smileys'] || [];
}

findSmileyIndex(smileysArray: Smiley[], smiley: string): number {
  return smileysArray.findIndex((s: Smiley) => s.smiley === smiley);
}

updateExistingSmiley(smileysArray: Smiley[], smileyIndex: number, smiley: string) {
  const clickedByUsers = smileysArray[smileyIndex].clickedBy.split(',').map(user => user.trim());

  if (!clickedByUsers.includes(this.loggedInUserName)) {
      clickedByUsers.push(this.loggedInUserName);
      smileysArray[smileyIndex].clickedBy = clickedByUsers.join(', ');
  } else {
      const newClickedByUsers = clickedByUsers.filter(user => user !== this.loggedInUserName);
      smileysArray[smileyIndex].clickedBy = newClickedByUsers.join(', ');

      if (newClickedByUsers.length === 0) {
          smileysArray.splice(smileyIndex, 1);
      }
  }
}

addNewSmiley(smileysArray: Smiley[], smiley: string) {
  smileysArray.push({
      smiley: smiley,
      clickedBy: this.loggedInUserName // Starte mit dem aktuellen Benutzer
  });
}

async updateFirebase(chatIndex: number) {
  const answerId = this.answerId;
  const messageDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${answerId}`);

  await updateDoc(messageDocRef, {
      chats: this.answerChats, // Aktualisiere das gesamte `chats`-Array
  });
}

generateReactionText(smiley: Smiley): string {
  const clickedByUsers = smiley.clickedBy.split(',').map(user => user.trim());
  const otherUsers = clickedByUsers.filter(user => user !== this.loggedInUserName);

  if (otherUsers.length === 0 && clickedByUsers.includes(this.loggedInUserName)) {
    return 'Du hast reagiert';
  }

  if (otherUsers.length === 1 && clickedByUsers.includes(this.loggedInUserName)) {
    return `${otherUsers[0]} und Du haben reagiert`;
  }

  if (otherUsers.length > 1 && clickedByUsers.includes(this.loggedInUserName)) {
    return `${otherUsers.slice(0, -1).join(', ')}, ${otherUsers[otherUsers.length - 1]} und Du haben reagiert`;
  }

  return `${clickedByUsers.join(', ')} haben reagiert`;
}

enableEditMode(chatIndex: number) {
  this.editModeIndex = chatIndex;
  this.editedText = this.answerChats[chatIndex].text; // Den aktuellen Text in editedText speichern
}

cancelEdit() {
  this.editModeIndex = null; // Bearbeitungsmodus verlassen
}

saveEdit(chatIndex: number) {
  if (this.editedText.trim()) {
    this.answerChats[chatIndex].text = this.editedText; // Den Text im Chat aktualisieren

    // Update in Firebase speichern
    const answerId = this.answerId;
    const messageDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${answerId}`);
    updateDoc(messageDocRef, {
      chats: this.answerChats // Aktualisiere die Chats in der Datenbank
    });

    this.editModeIndex = null; // Bearbeitungsmodus verlassen
  }
}


}



