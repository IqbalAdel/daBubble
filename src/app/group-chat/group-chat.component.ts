import { CommonModule, formatDate } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { DialogChannelEditComponent } from '../dialogs/dialogs-channel/dialog-channel-edit/dialog-channel-edit.component';
import { DialogChannelMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-add-members/dialog-channel-add-members.component';
import { ChatComponent, ChatMessage } from '../chat/chat.component';
import { Observable, switchMap } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { map } from 'rxjs/operators';
import { docSnapshots, Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, ChatComponent, RouterOutlet, FormsModule],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
})
export class GroupChatComponent implements OnInit, AfterViewChecked {
  user: User | null = null;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  channels$: Observable<Channel[]> | undefined;
  filteredChannels$: Observable<Channel[]> | undefined;
  groupId!: string;
  groupName!: string;
  groupDescription!: string;
  userChats: ChatMessage[] = [];
  isEditing: { [key: string]: boolean } = {};
  editedMessageText: { [key: string]: string } = {};
  selectedUserId: string = '';
  channelSubscription!: () => void;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  userName!: string;
  loggedInUserName!: string;
  chatsNummbers: ChatMessage[] = [];
  userImages: string[] = [];
  dataLoaded = false;

  messages: { id: string; text: string; timestamp: string; time: any; userName: string; chats: string }[] = [];
  groupUsers: User[] = [];
  imgSrc = ['assets/img/smiley/add_reaction.svg', 'assets/img/smiley/comment.png', 'assets/person_add.svg', 'assets/more_vert.png'];
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];
  groupName$: Observable<string | null> = this.userService.selectedChannelName$;

  constructor(
    private route: ActivatedRoute,
    public userService: UserService, // Richtiger Service Name
    private dialog: MatDialog, // Verwende nur eine Instanz von MatDialog
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private router: Router
  ) {
    this.groupName$ = this.userService.selectedChannelName$;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
      // this.loadGroupName();
      this.subscribeToGroupName();
      this.loadMessages();
      this.loadGroupUsers();
      this.loggedInUser();
      this.getChannelsForusers();
      this.loadUserChats();
      this.loadChannelData(this.groupId);
    });

  }

  ngAfterViewChecked() {
    // this.scrollToBottom();
  }

  isFirstMessageOfDay(currentMessage: any, index: number): boolean {
    if (index === 0) {
      return true; // Always show the date for the first message
    }
  
    const previousMessage = this.messages[index - 1];
    
    // Convert the timestamps to a valid Date object or ISO string
    const currentDate = this.parseGermanDate(currentMessage.timestamp); 
    const previousDate = this.parseGermanDate(previousMessage.timestamp); 
  
    // Ensure both dates are valid before comparing
    if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
      console.error('Invalid date format:', currentMessage.timestamp, previousMessage.timestamp);
      return false;
    }
  
    // Compare the dates without time
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  // Parse a German date string (e.g., 'Mittwoch, 18.09.2024')
  parseGermanDate(dateString: string): Date {
    // Extract the part after the day of the week
    const datePart = dateString.split(', ')[1]; // Get the '18.09.2024' part
    const [day, month, year] = datePart.split('.');
  
    // Return a Date object in the format 'YYYY-MM-DD'
    return new Date(`${year}-${month}-${day}`);
  }

  loadChats(): void {
    const channelId = 'your-channel-id'; // Channel ID hier setzen
    this.firebaseService.getChannelsMessages(channelId).subscribe(
      (messages: ChatMessage[]) => {
        this.chatsNummbers = messages;
      },
      (error) => {
        console.error('Fehler beim Abrufen der Nachrichten:', error);
      }
    );
  }

  loadMessages(): void {
    if (this.groupId) {
      this.firebaseService.getChannelsMessages(this.groupId).subscribe(
        (channelData: any[]) => {
          this.messages = this.formatMessages(channelData); // Formatierte Nachrichten setzen
        },
        (error: any) => {
          console.error('Fehler beim Abrufen der Nachrichten:', error);
        }
      );
    }
  }

  formatMessageTime(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',    // Stunde
      minute: '2-digit',  // Minute
      // Sekunden weglassen
    });
  }
  formatMessages(messages: any[]): any[] {
    let previousDate: string = "";
  
    return messages.map((message, index) => {
      const currentDate = this.formatTimestamp(message.timestamp); // Format the date
      const isFirstMessageOfDay = currentDate !== previousDate; // Check if it's the first message of the day
  
      previousDate = currentDate; // Update previousDate for next iteration
  
      return {
        ...message,
        timestamp: isFirstMessageOfDay ? currentDate : null, // Show date only for the first message of the day
        time: this.formatMessageTime(message.timestamp)      // Always show the time
      };
    });
  }

  formatTimestamp(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    const today = new Date();

        // Create a Date object for yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // If the message is from today, display 'Heute'
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    }
    // If the message is from yesterday, display 'Gestern'
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } 
    
    else {
      return date.toLocaleDateString('de-DE', { // Formatierung für deutsches Datum
        weekday: 'long',  // Wochentag
        day: '2-digit',   // Tag
        month: '2-digit', // Monat
        year: 'numeric'   // Jahr
      });
    }
  }

  loadUserChats(): void {
    if (this.selectedUserId) {
      this.firebaseService.getChatsForUser(this.selectedUserId).subscribe(
        (chats: ChatMessage[]) => {
          this.userChats = chats;
          // Optional: Verarbeite die Daten weiter, falls notwendig
        },
        (error) => {
          console.error('Fehler beim Abrufen der Chats:', error);
        }
      );
    }
  }

  async loggedInUser() {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; // Setze den Namen des eingeloggten Benutzers
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }


  // async loadGroupName() {
  //   try {
  //     if (this.groupId) {
  //       const channelData = await this.firebaseService.getChannelById(this.groupId);
  //       if (channelData) {
  //         this.groupName = channelData.name || 'Kein Name gefunden';  // Angenommene Struktur der Daten
  //       } else {
  //         this.groupName = 'Kein Name gefunden';
  //       }
  //     } else {
  //       this.groupName = 'Keine Gruppen-ID vorhanden';
  //     }
  //   } catch (error) {
  //     this.groupName = 'Fehler beim Laden';
  //   }
  // }

  subscribeToGroupName(): void {
    if (this.groupId) {

      const channelDocRef = doc(this.firestore, 'channels', this.groupId)

      this.channelSubscription = onSnapshot(channelDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const channelData = docSnapshot.data();
            this.groupName = channelData?.['name'] || 'kein Name gefunde';
            this.groupDescription = channelData?.['description'] || 'kein Name gefunde';
          } else {
            this.groupName = 'Kein name gefunden';
            this.groupDescription = 'Keine Beschreibung gefunden';
          }
        }
      );
    }
  }

  async loadGroupUsers() {
    try {
      const channelData = await this.firebaseService.getChannelById(this.groupId);
      if (channelData && channelData.users) {
        const userIds = channelData.users;  // Angenommene Struktur: users ist ein Array von User-IDs
        const userPromises = userIds.map((userId: string) => this.firebaseService.getUserById(userId));
        const users = await Promise.all(userPromises);

        // Filtere Benutzer, die null sind, heraus
        this.groupUsers = users.filter((user): user is User => user !== null);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Channel-Benutzer:', error);
    }
  }

  navigateToAnswers(answerId: string) {
    this.router.navigate([`/main/group-chat/${this.groupId}/group-answer/${answerId}`]);
    this.userService.showGroupAnswer = true;
  }


  changeImageSmiley(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/img/smiley/add_reaction-blue.svg' : 'assets/img/smiley/add_reaction.svg';
  }

  changeImageComment(isHover: boolean) {
    this.imgSrc[1] = isHover ? 'assets/img/smiley/comment-blue.png' : 'assets/img/smiley/comment.png';
  }

  changeImageAddContat(isHover: boolean) {
    this.imgSrc[2] = isHover ? 'assets/person_add_blue.svg' : 'assets/person_add.svg';
  }
  changeImageMoreVert(isHover: boolean) {
    this.imgSrc[3] = isHover ? 'assets/more_vert_hover.png' : 'assets/more_vert.png';
  }

  openDialog() {
    this.dialog.open(DialogChannelEditComponent, {
      panelClass: 'border-30',
      width: '700px',
      height: '400px',
      data: {
        channelID: this.groupId,
        channelName: this.groupName,
        channelDescription: this.groupDescription,
      }
    });
  }

  openDialogMemberList() {
    this.dialog.open(DialogChannelMembersComponent, {
      panelClass: 'border-30-right',
      width: '300px',
      position: { top: '200px', right: '100px' },
      data: {
        channelID: this.groupId,
      }

    });
  }

  openDialogAddMember() {
    this.dialog.open(DialogChannelAddMembersComponent, {
      panelClass: 'border-30-right',
      width: '400px',
      height: '200px',
      position: { top: '200px', right: '50px' },
      data: {
        channelID: this.groupId,
      },
      autoFocus: false,
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  getChannelsForusers() {
    this.filteredChannels$ = this.route.paramMap.pipe(
      switchMap(params => {
        const channelId = params.get('id');
        return this.firebaseService.getChannels().pipe(
          map(channels => channels.filter(channel => channel.id === channelId))
        );
      })
    );
  }

  async loadChannelData(channelId: string) {
    const channelData = await this.firebaseService.getChannelById(channelId);
    if (channelData) {
      const userIds = channelData.users;
      if (userIds) {
        await this.loadUserImages(userIds);
        this.dataLoaded = true;
      }
    }
  }

  async loadUserImages(userIds: string[]) {
    this.userImages = [];
    let i = 0; 
    for (const userId of userIds){
      const userData = await this.firebaseService.getUserById(userId);
      if(userData && i<5){
        this.userImages.push(userData.img)
        i++;
      }
    }
    console.log(this.userImages)
  }

  editText(messageId: string) {
    this.isEditing[messageId] = true;  // Aktiviert den Bearbeitungsmodus
    const currentText = this.messages.find(msg => msg.id === messageId)?.text;  // Findet den aktuellen Text der Nachricht
    if (currentText) {
      this.editedMessageText[messageId] = currentText;  // Speichert den aktuellen Text
    }
  }

  saveText(messageId: string) {
    this.isEditing[messageId] = false;  // Deaktiviert den Bearbeitungsmodus
    const newText = this.messages.find(msg => msg.id === messageId)?.text;  // Hole den neuen Text aus message.text
  
    if (newText) {
      this.firebaseService.updateMessage(messageId, newText)
        .then(() => {
          console.log('Nachricht erfolgreich gespeichert:', newText);
        })
        .catch(error => {
          console.error('Fehler beim Speichern der Nachricht:', error);
        });
    } else {
      console.log('Keine Änderungen im Text, nichts zu speichern.');
    }
  }
  
}


