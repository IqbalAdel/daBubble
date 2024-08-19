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

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
})
export class GroupChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  groupId!: string;
  groupName!: string;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  private storedDate: string = '';
  messages: { text: string; timestamp: string; time: string }[] = [];
  imgSrc = ['assets/img/smiley/add_reaction.png', 'assets/img/smiley/comment.png', 'assets/person_add.png'];
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];
  groupName$: Observable<string | null> = this.userServes.selectedChannelName$;

  constructor(
    private route: ActivatedRoute,
    public userServes: UserService, // Richtiger Service Name
    private dialog: MatDialog, // Verwende nur eine Instanz von MatDialog
    private fireStoree: FirebaseService
  ) {
    this.groupName$ = this.userServes.selectedChannelName$;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
      this.loadGroupName();
      this.loadMessages();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadMessages(): void {
    if (this.groupId) {
      this.fireStoree.getChannelsMessages(this.groupId).subscribe(
        (channelData: { text: string; timestamp: string; time: string }[]) => { // Typ für channelData
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


  formatMessageDate(timestamp: string): string {
    const messageDate = new Date(timestamp);
    const today = new Date();

    // Vergleich des Datums ohne die Zeit
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Heute';
    } else {
      return timestamp; // Gibt das ursprüngliche Datum zurück, wenn es nicht heute ist
    }
  }

  async loadGroupName() {
    try {
      if (this.groupId) {
        const channelData = await this.fireStoree.getChannelById(this.groupId);
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



  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
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
