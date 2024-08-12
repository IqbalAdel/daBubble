import { Component } from '@angular/core';
import { DevspaceComponent } from '../devspace/devspace.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { HeaderComponent } from './header/header.component';
import { DialogProfileUserCenterComponent } from '../dialogs/dialog-profile-user-center/dialog-profile-user-center.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { DialogChannelCreateComponent } from '../dialogs/dialogs-channel/dialog-channel-create/dialog-channel-create.component';
import { DialogChannelEditComponent } from '../dialogs/dialogs-channel/dialog-channel-edit/dialog-channel-edit.component';
import { DialogChannelMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-add-members/dialog-channel-add-members.component';
import { DialogChannelCreateAddMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-create-add-members/dialog-channel-create-add-members.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    DevspaceComponent, 
    GroupChatComponent,
    MainComponent,
    HeaderComponent,
    MatIcon,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  constructor( 
    public dialogUser: MatDialog
  ) {    
  }

  openDialog(){
    let dialogRef = this.dialogUser.open(DialogChannelCreateAddMembersComponent, {
      width: '700px',
      height: '465px',

    });
  }
}
