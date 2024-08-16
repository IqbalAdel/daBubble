import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  

  imgSrc: string = "assets/img/close_default.png";
  allUsers: User[] = []
  test = 'Hello';
  
  constructor(
    public dialog: MatDialogRef<DialogChannelAddMembersComponent>,
    private fire: FirebaseService,
    // @Inject(MAT_DIALOG_DATA) public data: { 
    //   name: string; 
    //   description: string; 
    //    }
  ) {
    this.fire.getUsersData().subscribe((list) => {
      this.allUsers = list.map(element => {
        const data = element;
        return new User(
          data['name'] || '',
          data['email'] || '',
          data['id'] || '', // Falls `id` ein optionales Feld ist
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

}
