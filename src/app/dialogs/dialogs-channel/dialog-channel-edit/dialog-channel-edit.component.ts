import { Component, Inject, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { Channel } from '../../../../models/channel.class';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-dialog-channel-edit',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
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


  constructor(
    public dialog: MatDialogRef<DialogChannelEditComponent>,
    private fire: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channelID: string; 
       }
  ) {
    this.channelID = data.channelID;
    // this.channel = this.fire.getChannelById(this.channelID);
  }

  async ngOnInit(): Promise<void> {
      try{
        this.channel = await this.fire.getChannelById(this.channelID);
        if(!this.channel){
          console.log('channel not found')
        }
      }
      catch(error){
        console.log('error channel edit, loading', error)
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
      this.editTxtValue = "Bearbeiten"
    }
  }
  editTwoSwitch() {
    this.editTwo = !this.editTwo;
    this.editTwoInput = !this.editTwoInput;
    if(this.editTwo == true){
      this.editTxtValueTwo = "Speichern"
    } else{
      this.editTxtValueTwo = "Bearbeiten"
    }
  }
}
