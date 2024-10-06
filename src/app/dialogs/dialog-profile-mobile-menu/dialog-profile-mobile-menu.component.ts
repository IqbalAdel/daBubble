import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, Renderer2 } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileUserCenterComponent } from '../dialog-profile-user-center/dialog-profile-user-center.component';
import { MatCardModule } from '@angular/material/card';
import { FirebaseService } from '../../services/firebase.service';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-profile-mobile-menu',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule
  ],
  templateUrl: './dialog-profile-mobile-menu.component.html',
  styleUrl: './dialog-profile-mobile-menu.component.scss'
})
export class DialogProfileMobileMenuComponent implements OnInit{

  currentUser: User = {
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
  @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();


  openMenu: boolean = false;

  constructor( 
    public dialogUser: MatDialog,
    private firebaseservice: FirebaseService,
    private userService: UserService,

  ) {  

  }

  async ngOnInit(){
    await this.getActiveUser();

  
  }

  openDialog(){
    this.openMenu = false;
    let dialogRef = this.dialogUser.open(DialogProfileUserCenterComponent, {
      backdropClass: 'custom-backdrop',
      panelClass: 'upper-right-round',
      // width: '350px',
      // height: '400px',
      // position: {top: '90px', right: '15px'},
      data: {
        username: this.currentUser.name,
        email: this.currentUser.email,
        image: this.currentUser.img,
        user: this.currentUser,
        status: this.userService.getUserStatus(this.currentUser.id)
      }

    });
  }

  async getActiveUser(){
    try {
      // UID des aktuell angemeldeten Benutzers abrufen
      const uid = await this.firebaseservice.getCurrentUserUid();
      if (uid) {
        // Benutzerdaten anhand der UID laden
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        if(user){
          this.currentUser = new User(user);
        }
      
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  close(){
    this.closeMenu.emit()
  }

}