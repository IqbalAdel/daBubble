import { Component, Inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-dialog-profile-user-center',
  standalone: true,
  imports: [
    MatCard,
    MatIcon,
    MatIconModule,
  ],
  templateUrl: './dialog-profile-user-center.component.html',
  styleUrl: './dialog-profile-user-center.component.scss'
})
export class DialogProfileUserCenterComponent {

  imgSrc: string = "assets/img/close_default.svg";
  public username: string;
  public email: string;
  public image: string;
  public user: User;

  constructor(
    public dialog: MatDialogRef<DialogProfileUserCenterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      username: string; email: string; image: string; user: User }
  ) {
    this.username = data.username;
    this.email = data.email;
    this.image = data.image;
    this.user = data.user;

    console.log('Empfangene Daten:', this.username, this.email, this.image, this.user);
  }


  closeDialog(){
    this.dialog.close();
  }
}
