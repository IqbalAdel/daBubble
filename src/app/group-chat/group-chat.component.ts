import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class GroupChatComponent implements OnInit {
  groupId!: string;
  groupName!: string;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  private storedDate: string = '';
  messages: string[] = [];

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
      this.updateDateTime();
      this.loadMessages();
      this.scheduleDailyUpdate();
      
    });
  }
  
  async loadMessages() {
    try {
      if (this.groupId) {
        const channelData = await this.fireStoree.getChannelsMessages(this.groupId);
        if (channelData) {
          this.messages = channelData['messages'] || [];
        }
      } else {
        console.error('Keine Gruppen-ID vorhanden.');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
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

  updateDateTime(): void {
    const today = new Date();
    const formattedDate = today.toLocaleDateString();

    // Überprüfe, ob das Datum neu ist
    if (this.storedDate !== formattedDate) {
      this.currentDate = formattedDate;
      this.currentTime = this.formatTime(today);
      this.displayDate = this.isToday(today) ? 'Heute' : this.currentDate;
      this.storedDate = formattedDate; // Speichere das aktuelle Datum
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  scheduleDailyUpdate() {
    // Berechne die Zeit bis zur nächsten Mitternacht
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0); // Setzt auf nächste Mitternacht

    const timeToMidnight = nextMidnight.getTime() - now.getTime();

    // Stelle einen Intervall für das tägliche Update ein
    setTimeout(() => {
      this.updateDateTime(); // Führe sofort das Update durch
      setInterval(() => this.updateDateTime(), 24 * 60 * 60 * 1000); // Update täglich
    }, timeToMidnight);
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
      position: {top: '200px', right: '100px'},
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
}
