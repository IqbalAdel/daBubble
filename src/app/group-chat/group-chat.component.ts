import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { DialogChannelEditComponent } from '../dialogs/dialogs-channel/dialog-channel-edit/dialog-channel-edit.component';
import { DialogChannelMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-add-members/dialog-channel-add-members.component';
import { ChatComponent } from '../chat/chat.component';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';

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
  groupId!: string;
  groupName!: string;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  userName!: string;
  loggedInUserName!: string;

  messages: { text: string; timestamp: string; time: string; userName: string }[] = [];
  groupUsers: User[] = [];
  imgSrc = ['assets/img/smiley/add_reaction.png', 'assets/img/smiley/comment.png', 'assets/person_add.png'];
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];
  groupName$: Observable<string | null> = this.userService.selectedChannelName$;

  constructor(
    private route: ActivatedRoute,
    public userService: UserService, // Richtiger Service Name
    private dialog: MatDialog, // Verwende nur eine Instanz von MatDialog
    private firebaseService: FirebaseService,
  ) {
    this.groupName$ = this.userService.selectedChannelName$;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
      this.loadGroupName();
      this.loadMessages();
      this.loadGroupUsers(); 
      this.loggedInUser();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadMessages(): void {
    if (this.groupId) {
      this.firebaseService.getChannelsMessages(this.groupId).subscribe(
        (channelData: { text: string; timestamp: string; time: string; userName: string }[]) => { // Typ für channelData
          if (channelData) {
            this.messages = channelData;
          } else {
            this.messages = [];
          }
        },
        (error: any) => { // Typ für error
          console.error('Fehler beim Abrufen der Nachrichten:', error);
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


  async loadGroupName() {
    try {
      if (this.groupId) {
        const channelData = await this.firebaseService.getChannelById(this.groupId);
        if (channelData) {
          this.groupName = channelData.name || 'Kein Name gefunden';  // Angenommene Struktur der Daten
        } else {
          this.groupName = 'Kein Name gefunden';
        }
      } else {
        this.groupName = 'Keine Gruppen-ID vorhanden';
      }
    } catch (error) {
      this.groupName = 'Fehler beim Laden';
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
  
}
