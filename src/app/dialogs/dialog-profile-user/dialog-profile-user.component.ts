import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-profile-user',
  standalone: true,
  imports: [
    MatCard,

  ],
  templateUrl: './dialog-profile-user.component.html',
  styleUrl: './dialog-profile-user.component.scss'
})
export class DialogProfileUserComponent {

  imgSrc:string = "assets/img/close_default.png";

  constructor( public dialog: MatDialogRef<DialogProfileUserComponent> ) {    
  }

   closeDialog(){
    this.dialog.close();
  }

}
