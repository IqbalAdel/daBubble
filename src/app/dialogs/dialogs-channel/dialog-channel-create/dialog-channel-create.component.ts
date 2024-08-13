import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogChannelCreateAddMembersComponent } from '../dialog-channel-create-add-members/dialog-channel-create-add-members.component';

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

  constructor( 
    public dialogChannel: MatDialogRef<DialogChannelCreateComponent>, 
    public dialogAddMembers: MatDialog,
  ) {    
  }


  closeDialog(){
    this.dialogChannel.close();
  }

  openDialogAddMembers(){
    this.dialogChannel.close();
    let dialogRef = this.dialogAddMembers.open(DialogChannelCreateAddMembersComponent, {
      panelClass: 'border-30',
      width: '600px',
      height: '200px',
    });
  }
}
