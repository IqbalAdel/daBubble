import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../../models/user.class';

import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, setDoc, docData } from '@angular/fire/firestore';
import { DialogChannelAddMembersComponent } from '../dialog-channel-add-members/dialog-channel-add-members.component';
import { DialogProfileUserCenterComponent } from '../../dialog-profile-user-center/dialog-profile-user-center.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dialog-channel-members',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
  ],
  templateUrl: './dialog-channel-members.component.html',
  styleUrl: './dialog-channel-members.component.scss'
})
export class DialogChannelMembersComponent{

  imgSrc: string = "assets/img/close_default.png";
  imgSrcAdd: string = "assets/img/person_add_default.png";

  allUsers: User[] = [];
  channelID: string = "";

  // dialogRefAddMember: MatDialogRef<DialogChannelAddMembersComponent>;


  constructor( 
    public dialog: MatDialogRef<DialogChannelMembersComponent>,
    private dialogRefAddMember: MatDialogRef<DialogChannelAddMembersComponent>,
    private dialogChannelAddMember: MatDialog,
    private dialogProfile: MatDialog,
    private fire: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channelID: string; 
       }
  ) {  
    this.channelID = data.channelID;
    console.log('received id:', this.channelID)

    this.fire.getChannels().subscribe((channels) => {
      const channel = channels.find(c => c['id'] === this.channelID);
      
      if (channel && channel['users']) {
        const userIDs = channel['users'];

        const userPromises = userIDs.map((userID: string) =>{
          return this.fire.getUserById(userID);
        })

        Promise.all(userPromises).then(users => {
          this.allUsers = users.filter(user => user !== null) as User[]
        })
    
        console.log(this.allUsers);
      } else {
        console.error('No users found in this channel or channel not found.');
      }
    });
  }


  closeDialog(){
    this.dialog.close();
  }

  openDialogAddMember(){
    this.dialog.close();
    this.dialogRefAddMember = this.dialogChannelAddMember.open(DialogChannelAddMembersComponent, {
      panelClass: 'border-30-right',
      width: '400px',
      height: '200px',
      position: {top: '200px', right: '50px'},

    });
  }
  openDialogMemberProfile(user: User){
    this.dialogRefAddMember.close();
    let dialogRef = this.dialogProfile.open(DialogProfileUserCenterComponent, {
      panelClass: 'border-30-right',
      width: '400px',
      height: '450px',
      data: {
        username: user.name,
        email: user.email,
        image: user.img,
        user: user,
      }

    });
  }


}
