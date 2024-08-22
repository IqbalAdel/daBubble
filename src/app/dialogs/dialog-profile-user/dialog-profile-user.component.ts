import { Component, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileUserEditComponent } from '../dialog-profile-user-edit/dialog-profile-user-edit.component';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-dialog-profile-user',
  standalone: true,
  imports: [
    MatCard,

  ],
  templateUrl: './dialog-profile-user.component.html',
  styleUrl: './dialog-profile-user.component.scss'
})
export class DialogProfileUserComponent implements OnInit{

  imgSrc:string = "assets/img/close_default.png";

  user: User = {
    name: 'Frederick Beck',
    email: 'Test@gmx.de',
    id: '',
    img: 'assets/img/profiles/boy.png',
    password: '',
    channels: [],
    chats: [],
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };

  constructor( 
    public dialog: MatDialogRef<DialogProfileUserComponent>, 
    public dialogUserEdit: MatDialog,
    public userService: UserService,
    public fire: FirebaseService
  ) {    
  }

  openDialog(){
    this.dialog.close();
    let dialogRef = this.dialogUserEdit.open(DialogProfileUserEditComponent, {
      backdropClass: 'custom-backdrop',
      panelClass: 'border-radius',
      width: '350px',
      height: '465px',
      position: {top: '90px', right: '15px'},

    });
  }

   closeDialog(){
    this.dialog.close();
  }

  async ngOnInit(): Promise<void> {
    try {
      // UID des aktuell angemeldeten Benutzers abrufen
      const uid = await this.fire.getCurrentUserUid();
      if (uid) {
        // Benutzerdaten anhand der UID laden
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        if(user){
          this.user = user;
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }


}
