import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileUserEditComponent } from '../dialog-profile-user-edit/dialog-profile-user-edit.component';

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

  constructor( 
    public dialog: MatDialogRef<DialogProfileUserComponent>, 
    public dialogUserEdit: MatDialog
  ) {    
  }

  openDialog(){
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

}
