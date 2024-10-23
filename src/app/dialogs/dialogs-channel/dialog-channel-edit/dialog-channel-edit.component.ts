import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { Channel } from '../../../../models/channel.class';
import { catchError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../models/user.class';
import { UserService } from '../../../services/user.service';
import { DialogChannelMembersComponent } from '../dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddMemberMobileComponent } from '../dialog-channel-add-member-mobile/dialog-channel-add-member-mobile.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-channel-edit',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
    FormsModule,
    DialogChannelMembersComponent,
    DialogChannelAddMemberMobileComponent,
  ],
  templateUrl: './dialog-channel-edit.component.html',
  styleUrls: ['./dialog-channel-edit.component.scss'],
})

export class DialogChannelEditComponent implements OnInit{
  edit!:boolean ;
  editTwo!:boolean ;
  editTwoInput!:boolean ;
  editImg = 'assets/editPencil.svg'
  editImg2 = 'assets/editPencil.svg'

  imgSrc: string = "assets/img/close_default.svg";
  channelID: string = "";
  channel: Channel | null = null;
  editTxtValue: string = "Bearbeiten";
  editTxtValueTwo: string = "Bearbeiten";
  imgSrcAdd: string = "assets/person_add_default.svg";

  showAddMemberMenu = false;

  name: string = "";
  description: string = "";
  channelName: string;
  channelDescription: string;
  screenWidth: number = 0;

  user: User = {
    name: '',
    email: 'Test@gmx.de',
    id: '',
    img: '',
    password: '',
    channels: [],
    chats: [],
    state: 'offline',
    lastChanged: Date.now(),
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };
  @ViewChild(DialogChannelMembersComponent) membersList!: DialogChannelMembersComponent;
  @ViewChild(DialogChannelAddMemberMobileComponent) addMembersMobile!: DialogChannelAddMemberMobileComponent;
  

  constructor(
    public dialog: MatDialogRef<DialogChannelEditComponent>,
    private fire: FirebaseService,
    private userService: UserService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channelID: string; 
      channelName: string; 
      channelDescription: string; 
       }
  ) {
    this.channelID = data.channelID;
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescription;
    this.name = data.channelName;
    this.description = data.channelDescription;
    
  }

  async ngOnInit(): Promise<void> {
    await this.getActiveUser();
      try{
        this.channel = await this.fire.getChannelById(this.channelID);
        if(!this.channel){
          console.error('channel not found')
        }
      }
      catch(error){
        console.log('error channel edit, loading', error)
      }
    this.screenWidth = window.innerWidth;
    this.membersList.hideButton = true;
    this.addMembersMobile.channelID = this.channelID
  }

  async getActiveUser(){
    try {
      const uid = await this.fire.getCurrentUserUid();
      if (uid) {

        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        if(user){
          this.user = new User(user);
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
    if(this.membersList){
      this.membersList.hideButton = true;
    }
    if(this.screenWidth > 992 && this.showAddMemberMenu){
      this.closeDialogAddMember()
    }
  }

  closeDialog() {
    this.dialog.close();
  }

  editSwitch() {
    this.edit = !this.edit;
    if(this.edit == true){
      this.editTxtValue = "Speichern"
      this.editImg2 = 'assets/saveCheck.svg'
    } else{
      this.saveData('name');
      this.channelName = this.name;
      this.editTxtValue = "Bearbeiten"
      this.editImg2 = 'assets/editPencil.svg'
    }
  }

  editTwoSwitch() {
    this.editTwo = !this.editTwo;
    this.editTwoInput = !this.editTwoInput;
    if(this.editTwo == true){
      this.editTxtValueTwo = "Speichern"
      this.editImg = 'assets/saveCheck.svg'
    } else{
      this.saveData('description');
      this.channelDescription = this.description;
      this.editTxtValueTwo = "Bearbeiten"
      this.editImg = 'assets/editPencil.svg'
    }
  }

  async saveData(editField: string){
    if(this.name.length > 0 || this.description.length >0 && this.channelID){
      await this.fire.updateChannelData(this.channelID, editField, this.name, this.description )
    }
  }

  leaveChannel(){
    this.fire.deleteChannelFromUser(this.user.id, this.channelID)
    this.fire.deleteUserFromChannel(this.channelID, this.user.id)
    this.dialog.close();
    this.router.navigate(['/new-message']);
  }

  openDialogAddMember(){
    this.showAddMemberMenu = true;
  }
  closeDialogAddMember(){
    this.showAddMemberMenu = false;
  }
}
