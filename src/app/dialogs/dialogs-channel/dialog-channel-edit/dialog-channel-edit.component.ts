import { Component, Inject, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { Channel } from '../../../../models/channel.class';
import { catchError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../models/user.class';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dialog-channel-edit',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './dialog-channel-edit.component.html',
  styleUrls: ['./dialog-channel-edit.component.scss'],
})

export class DialogChannelEditComponent implements OnInit{
  edit!:boolean ;
  editTwo!:boolean ;
  editTwoInput!:boolean ;

  imgSrc: string = "assets/img/close_default.png";
  channelID: string = "";
  channel: Channel | null = null;
  editTxtValue: string = "Bearbeiten";
  editTxtValueTwo: string = "Bearbeiten";

  name: string = "";
  description: string = "";
  channelName: string;
  channelDescription: string;

  user: User = {
    name: '',
    email: 'Test@gmx.de',
    id: '',
    img: '',
    password: '',
    channels: [],
    chats: [],
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };
  

  constructor(
    public dialog: MatDialogRef<DialogChannelEditComponent>,
    private fire: FirebaseService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channelID: string; 
      channelName: string; 
      channelDescription: string; 
       }
  ) {
    this.channelID = data.channelID;
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescription;
    // this.channel = this.fire.getChannelById(this.channelID);
  }

  async ngOnInit(): Promise<void> {
    await this.getActiveUser();
      try{
        this.channel = await this.fire.getChannelById(this.channelID);
        if(!this.channel){
          console.log('channel not found')
        }
      }
      catch(error){
        console.log('error channel edit, loading', error)
      }
    console.log(this.user.id)
  }

  async getActiveUser(){
    try {
      // UID des aktuell angemeldeten Benutzers abrufen
      const uid = await this.fire.getCurrentUserUid();
      if (uid) {
        // Benutzerdaten anhand der UID laden
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

  closeDialog() {
    this.dialog.close();
  }


  editSwitch() {
    this.edit = !this.edit;
    if(this.edit == true){
      this.editTxtValue = "Speichern"
    } else{
      this.saveData('name');
      this.channelName = this.name;
      this.editTxtValue = "Bearbeiten"
    }
  }
  editTwoSwitch() {
    this.editTwo = !this.editTwo;
    this.editTwoInput = !this.editTwoInput;
    if(this.editTwo == true){
      this.editTxtValueTwo = "Speichern"
    } else{
      this.saveData('description');
      this.channelDescription = this.description;
      this.editTxtValueTwo = "Bearbeiten"
    }
  }

  async saveData(editField: string){
    if(this.name.length > 0 || this.description.length >0 && this.channelID){
      await this.fire.updateChannelData(this.channelID, editField, this.name, this.description )
    }

    console.log(this.description)
    console.log(this.name)
    // this.dialog.close();

  }

  leaveChannel(){
    this.fire.deleteChannelFromUser(this.user.id, this.channelID)
    this.fire.deleteUserFromChannel(this.channelID, this.user.id)
    this.dialog.close();
  }
}
