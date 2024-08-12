import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-create',
  standalone: true,
  imports: [
    MatCard,
  ],
  templateUrl: './dialog-channel-create.component.html',
  styleUrl: './dialog-channel-create.component.scss'
})
export class DialogChannelCreateComponent {

  imgSrc: string = "assets/img/close_default.png";

  constructor( public dialog: MatDialogRef<DialogChannelCreateComponent> ) {    
  }


  closeDialog(){
    this.dialog.close();
  }
}
