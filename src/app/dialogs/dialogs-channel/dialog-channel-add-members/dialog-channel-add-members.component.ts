import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-add-members',
  standalone: true,
  imports: [
    MatCard,
  ],
  templateUrl: './dialog-channel-add-members.component.html',
  styleUrl: './dialog-channel-add-members.component.scss'
})
export class DialogChannelAddMembersComponent {

  imgSrc: string = "assets/img/close_default.png";
  

  constructor( public dialog: MatDialogRef<DialogChannelAddMembersComponent> ) {    
  }


  closeDialog(){
    this.dialog.close();
  }
}
