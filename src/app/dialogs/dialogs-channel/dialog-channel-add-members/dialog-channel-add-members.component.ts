import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatLabel, MatSelectModule } from '@angular/material/select';
import { ChipsAddMembersComponent } from '../../../chips/chips-add-members/chips-add-members.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-dialog-channel-add-members',
  standalone: true,
  imports: [
    MatCard,
    MatSelectModule,
    MatOptionModule,
    MatLabel,
    ChipsAddMembersComponent,
    CommonModule,
    
  ],
  templateUrl: './dialog-channel-add-members.component.html',
  styleUrl: './dialog-channel-add-members.component.scss'
})
export class DialogChannelAddMembersComponent{

  @ViewChild(ChipsAddMembersComponent) chipsAddMembersComponent!: ChipsAddMembersComponent;
  

  imgSrc: string = "assets/img/close_default.svg";
  allUsers: User[] = []
  test = 'Hello';
  channelID: string = "";
  userId = "";

  
  constructor(
    public dialog: MatDialogRef<DialogChannelAddMembersComponent>,
    private fire: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channelID: string; 
       }
  ) {

    this.channelID = data.channelID;

    this.fire.getUsersData().subscribe((list) => {
      this.allUsers = list.map(element => {
        const data = element;
        return new User(
          data['name'] || '',
          data['email'] || '',
          data['id'] || '',
          data['img'] || '',
          data['password'] || '',
          data['channels'] || [],
          data['chats'] || []
        );
      });
    });

  }




  closeDialog(){
    this.dialog.close();
  }

  checkUserSelection() {
    if (this.chipsAddMembersComponent) {
      return this.chipsAddMembersComponent.userSelected();
    }
    else{
      return false
    }
  }

  triggerChipsFormSubmit(): void {
    if (this.chipsAddMembersComponent) {
      this.chipsAddMembersComponent.onSubmit();
    }
  }

  async onSubmit(): Promise<void> {
    const users: User[] = this.chipsAddMembersComponent.users();
      if (users.length > 0) {
        const selectedUser = users[0]; 
        if(selectedUser.id){
          this.userId = selectedUser.id; 
        }
      }
      await this.addChannelToUser();
      await this.addUserToChannel();
      this.dialog.close(); 
  }
  
  async addChannelToUser(){
    if (this.userId.length>0 && this.channelID.length>0) {
      try {
        await this.fire.updateUserChannels(this.userId, this.channelID);
      } catch (error) {
        console.error('Failed to update user channels:', error);
      }
    } else {
      console.error('No user selected or user ID is missing.');
    }
  }

  async addUserToChannel(){
    if (this.userId.length>0 && this.channelID.length>0) {
      try {
        await this.fire.updateChannelUserList(this.userId, this.channelID);
      } catch (error) {
        console.error('Failed to update user channels:', error);
      }
    } else {
      console.error('No user selected or user ID is missing.');
    }
  }
}
