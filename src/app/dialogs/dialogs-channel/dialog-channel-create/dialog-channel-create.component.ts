import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogChannelCreateAddMembersComponent } from '../dialog-channel-create-add-members/dialog-channel-create-add-members.component';
import { Channel } from '../../../../models/channel.class';
import { FirebaseService } from '../../../services/firebase.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInput, MatInputModule } from '@angular/material/input';
import { DialogChannelCreateAddMemberMobileComponent } from '../dialog-channel-create-add-member-mobile/dialog-channel-create-add-member-mobile.component';

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
    DialogChannelCreateAddMemberMobileComponent,
  ],
  templateUrl: './dialog-channel-create.component.html',
  styleUrl: './dialog-channel-create.component.scss'
})
export class DialogChannelCreateComponent {

  @ViewChild(DialogChannelCreateAddMemberMobileComponent) createChannelAddMobile!: DialogChannelCreateAddMemberMobileComponent;

  imgSrc: string = "assets/img/close_default.svg";
  name: string = '';
  description: string = '';
  showAddMemberMenu = false;
  


  constructor( 
    public dialogChannel: MatDialogRef<DialogChannelCreateComponent>, 
    public dialogAddMembers: MatDialog,
    public dialogAddMembersClose: MatDialogRef<DialogChannelCreateAddMembersComponent>,
    private fire: FirebaseService,
  ) {    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const screenWidth = window.innerWidth;
    if(screenWidth >= 992){
      this.showAddMemberMenu = false;
    }
    }

  closeDialog(){
    this.dialogChannel.close();
  }

  openDialogAddMembers(){
    this.dialogChannel.close();
    let dialogRef = this.dialogAddMembers.open(DialogChannelCreateAddMembersComponent, {
      panelClass: 'border-30',
      width: '600px',
      data: {
        name: this.name,
        description: this.description,
      }
    });
  }


  onSubmit(): void {
    if(window.innerWidth <= 992){
      this.addMembersToNewChannelMobile()
      if(this.createChannelAddMobile){
        this.createChannelAddMobile.newChannel.name = this.name;
        this.createChannelAddMobile.newChannel.description = this.description;
      }

    } else{
      this.openDialogAddMembers();
    }
  }

  addMembersToNewChannelMobile(){
    this.showAddMemberMenu = true;

  }

  closeDialogAddMembersMobile(){
    this.showAddMemberMenu = false;
    
  }

}
