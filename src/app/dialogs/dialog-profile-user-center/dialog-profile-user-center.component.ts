import { Component, Inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-profile-user-center',
  standalone: true,
  imports: [
    MatCard,
    MatIcon,
    MatIconModule,
    CommonModule
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
  public status: boolean;

  constructor(
    public dialog: MatDialogRef<DialogProfileUserCenterComponent>,
    public userService: UserService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { 
      username: string; email: string; image: string; user: User; status: boolean }
  ) {
    this.username = data.username;
    this.email = data.email;
    this.image = data.image;
    this.user = data.user;
    this.status = data.status;
  }


  closeDialog(){
    this.dialog.close();
  }

  sendMessageToUser(uid: string){
    this.dialog.close();
    this.router.navigate(['/main/chat', uid]);
  }
}
