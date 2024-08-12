import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-profile-user-edit',
  standalone: true,
  imports: [
    MatCard
  ],
  templateUrl: './dialog-profile-user-edit.component.html',
  styleUrl: './dialog-profile-user-edit.component.scss'
})
export class DialogProfileUserEditComponent {

  imgSrc: string = "assets/img/close_default.png";

  constructor( public dialog: MatDialogRef<DialogProfileUserEditComponent> ) {    
  }


  closeDialog(){
    this.dialog.close();
  }

}
