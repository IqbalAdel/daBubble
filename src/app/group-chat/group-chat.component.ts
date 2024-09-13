import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DialogChannelEditComponent } from '../dialogs/dialogs-channel/dialog-channel-edit/dialog-channel-edit.component';
import { DialogChannelMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-add-members/dialog-channel-add-members.component';
import { ChatComponent, ChatMessage } from '../chat/chat.component';
import { Observable, switchMap } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import {  map } from 'rxjs/operators'; 
import { docSnapshots, Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, ChatComponent],
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
  selectedUserId: string = ''; 
  channelSubscription!: () => void; 

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  userName!: string;
  loggedInUserName!: string;
  chatsNummbers: ChatMessage[] = [];
  userImages: string[] = [];

  messages: { id:string; text: string; timestamp: string; time: string; userName: string; chats: string}[] = [];
  groupUsers: User[] = [];
  imgSrc = ['assets/img/smiley/add_reaction.png', 'assets/img/smiley/comment.png', 'assets/person_add.png'];
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
    this.scrollToBottom();
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
    return messages.map(message => {
      return {
        ...message,
        timestamp: this.formatTimestamp(message.timestamp), // Datum formatieren
        time: this.formatMessageTime(message.timestamp)   // Zeit ohne Sekunden formatieren
      };
    });
  }

  formatTimestamp(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    const today = new Date();
  
    if (date.toDateString() === today.toDateString()) {
      return 'Heute'; // Wenn Datum von heute ist
    } else {
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

  subscribeToGroupName(): void{
    if(this.groupId){

      const channelDocRef = doc(this.firestore, 'channels', this.groupId)

      this.channelSubscription = onSnapshot(channelDocRef, 
        (docSnapshot) =>{
          if(docSnapshot.exists()){
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

  navigateToAnswers(messageId: string) {
    this.router.navigate(['/main/group-answer', messageId]);
  }
  

  changeImageSmiley(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/img/smiley/add_reaction-blue.png' : 'assets/img/smiley/add_reaction.png';
  }

  changeImageComment(isHover: boolean) {
    this.imgSrc[1] = isHover ? 'assets/img/smiley/comment-blue.png' : 'assets/img/smiley/comment.png';
  }

  changeImageAddContat(isHover: boolean) {
    this.imgSrc[2] = isHover ? 'assets/person_add_blue.png' : 'assets/person_add.png';
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

  async loadChannelData(channelId: string){
    const channelData = await this.firebaseService.getChannelById(channelId);
    if(channelData){
      const userIds = channelData.users;
      if(userIds){
        await this.loadUserImages(userIds);
      }
    }
  }

  async loadUserImages(userIds: string[]){
    this.userImages = [];
    for (const userId of userIds){
      const userData = await this.firebaseService.getUserById(userId);
      if(userData){
        this.userImages.push(userData.img)
      }
    }
    console.log(this.userImages)
  }
  
}
  
  
