import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';

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

  imgSrc: string = "assets/img/close_default.png";

  constructor( public dialog: MatDialogRef<DialogProfileUserCenterComponent> ) {    
  }


  closeDialog(){
    this.dialog.close();
  }
}
