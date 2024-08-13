import { Component, Input, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
    CommonModule
  ],
  templateUrl: './dialog-channel-members.component.html',
  styleUrl: './dialog-channel-members.component.scss'
})
export class DialogChannelMembersComponent{

  imgSrc: string = "assets/img/close_default.png";
  imgSrcAdd: string = "assets/img/person_add_default.png";

  allUsers: User[] = [];

  // dialogRefAddMember: MatDialogRef<DialogChannelAddMembersComponent>;


  constructor( 
    public dialog: MatDialogRef<DialogChannelMembersComponent>,
    private dialogRefAddMember: MatDialogRef<DialogChannelAddMembersComponent>,
    private dialogChannelAddMember: MatDialog,
    private dialogProfile: MatDialog,
    private fire: FirebaseService,

  ) {  

    this.fire.getUsers().subscribe((list) => {
      this.allUsers = list.map(element => {
        const data = element;
        return new User(
          data['name'] || '',
          data['email'] || '',
          data['id'] || '', // Falls `id` ein optionales Feld ist
          data['img'] || '',
          data['password'] || '',
          data['channels'] || [],
          data['chats'] || []
        );
      });
      console.log(this.allUsers)
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
