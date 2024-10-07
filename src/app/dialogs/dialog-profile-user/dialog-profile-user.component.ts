import { Component, HostListener, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileUserEditComponent } from '../dialog-profile-user-edit/dialog-profile-user-edit.component';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-profile-user',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
  ],
  templateUrl: './dialog-profile-user.component.html',
  styleUrl: './dialog-profile-user.component.scss'
})
export class DialogProfileUserComponent implements OnInit{

  imgSrc:string = "assets/img/close_default.svg";

  user: User = {
    name: '',
    email: '',
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

  screenWidth: number = 0;

  constructor( 
    public dialog: MatDialogRef<DialogProfileUserComponent>, 
    public dialogUserEdit: MatDialog,
    public userService: UserService,
    public fire: FirebaseService
  ) {    
    this.screenWidth = window.innerWidth
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
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

  openEditMob(){
    this.dialog.close();
    let dialogRef = this.dialogUserEdit.open(DialogProfileUserEditComponent, {
      panelClass: 'mobile-profile',
      width: 'calc(100% - 20px)',
      height: 'calc(100% - 40px)',
      autoFocus: false,
      // position: {top: '90px', right: '15px'},
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
