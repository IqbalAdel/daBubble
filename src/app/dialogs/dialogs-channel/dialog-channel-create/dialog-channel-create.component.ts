import { Component, Input } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogChannelCreateAddMembersComponent } from '../dialog-channel-create-add-members/dialog-channel-create-add-members.component';
import { Channel } from '../../../../models/channel.class';
import { FirebaseService } from '../../../services/firebase.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInput, MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-channel-create',
  standalone: true,
  imports: [
    MatCard,
    MatFormField,
    MatLabel,
    FormsModule,
    CommonModule,
    MatInputModule,
  ],
  templateUrl: './dialog-channel-create.component.html',
  styleUrl: './dialog-channel-create.component.scss'
})
export class DialogChannelCreateComponent {

  imgSrc: string = "assets/img/close_default.svg";
  name: string = '';
  description: string = '';
  


  constructor( 
    public dialogChannel: MatDialogRef<DialogChannelCreateComponent>, 
    public dialogAddMembers: MatDialog,
    private fire: FirebaseService,
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
      // height: '250px',
      data: {
        name: this.name,
        description: this.description,
      }
    });
  }


  onSubmit(): void {
    // if (this.name.trim() === '' || this.description.trim() === '') {
    //   // Form is invalid
    //   console.log('Form is invalid');
    //   return;
    // }
    // else{
    // }
    this.openDialogAddMembers();
  }
}
