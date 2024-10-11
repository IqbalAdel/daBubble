import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { ChipsAddMembersComponent } from '../../../chips/chips-add-members/chips-add-members.component';
import { User } from '../../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-channel-add-member-mobile',
  standalone: true,
  imports: [
    MatCard,
    ChipsAddMembersComponent,
    CommonModule,
  ],
  templateUrl: './dialog-channel-add-member-mobile.component.html',
  styleUrl: './dialog-channel-add-member-mobile.component.scss'
})
export class DialogChannelAddMemberMobileComponent {

  imgSrcClose: string = "assets/img/close_default.svg";

  @ViewChild(ChipsAddMembersComponent) chipsAddMembersComponent!: ChipsAddMembersComponent;
  @Output() closeAddMenu: EventEmitter<void> = new EventEmitter<void>();
  @Output() successAdd: EventEmitter<void> = new EventEmitter<void>();

  closeDialogAddMember(){
    this.closeAddMenu.emit();
  }



  

  allUsers: User[] = []
  test = 'Hello';
  channelID: string = "";
  userId = "";

  
  constructor(
    private fire: FirebaseService,
  
  ) {

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
      this.successAdd.emit(); 
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
