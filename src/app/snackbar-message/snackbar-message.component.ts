import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-snackbar-message',
  standalone: true,
  imports: [
  ],
  templateUrl: './snackbar-message.component.html',
  styleUrl: './snackbar-message.component.scss'
})
export class SnackbarMessageComponent {

  test = false;

  constructor(
    public userService: UserService,
  ){}

  snackBarRef = inject(MatSnackBarRef);

  close(){
    this.snackBarRef.dismiss();
  }

  onAction(){
    this.snackBarRef.dismissWithAction();
  }


}
