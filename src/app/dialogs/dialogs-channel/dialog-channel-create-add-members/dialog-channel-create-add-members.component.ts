import { Component, Inject, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../../../models/channel.class';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-dialog-channel-create-add-members',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    FormsModule,
  ],
  templateUrl: './dialog-channel-create-add-members.component.html',
  styleUrl: './dialog-channel-create-add-members.component.scss',
  animations: [
    trigger('inputAppear', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-20px)', 
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)',  
      })),
      transition('hidden => visible', animate('225ms ease-in-out')),
    ]),
  ],
})
export class DialogChannelCreateAddMembersComponent implements OnInit{

  imgSrc: string = "assets/img/close_default.png";
  inputState: string = 'hidden';
  selectedValue: string = 'option1';

  // public name: string;
  // public description: string;
  public channelID: string | null = null;
  newChannel = new Channel();

  allUsers: User[] = [];


  constructor(
    public dialog: MatDialogRef<DialogChannelCreateAddMembersComponent>,
    private fire: FirebaseService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: { 
      name: string; 
      description: string; 
       }
  ) {
    
    this.newChannel.name = data.name; 
    this.newChannel.description = data.description; 


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
      console.log(this.allUsers)
    });
  }  

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.channelID = paramMap.get('id');
      console.log('channel: ',this.channelID)
    });

    this.route.paramMap.subscribe(params => {
      let KroupId = params.get('id') || '';
      let KroupName = params.get('name') || '';

      console.log('KroupId:', KroupId);
      console.log('KroupName:', KroupName);

      // Update any other component logic that depends on groupId or groupName
    });
}

  async onAddChannel() {
  //   const channelData = {
  //     name: this.newChannel.name,
  //     description: this.newChannel.description,
  //     creator: this.newChannel.creator,
  //     messages: this.newChannel.messages,
  //     users: this.newChannel.users,
  //     id: this.newChannel.id,
  // };
    try {
      await this.fire.addChannel(this.newChannel);
      // this.dialog.close();
      //  Neeeds to happen here somehere

    } catch (error) {
      console.error('Failed to add channel:', error);
    }
  }


  closeDialog(){
    this.dialog.close();
  }



  animate() {
    this.inputState = 'visible';
    
  }

  reverseAnimate() {
    this.inputState = 'hidden';  
  }

    onRadioChange(value: string) {
      this.selectedValue = value;
      if (this.selectedValue === 'option1') {
        this.reverseAnimate()
      } else if (this.selectedValue === 'option2') {
        this.animate();
      }
    }
  
    onSubmit(): void {
      if (this.selectedValue === "option1") {
        console.log('Selected Option:', this.selectedValue);
        const usersAsPlainObjects = this.allUsers.map(user => user.usersToJSON());

        // Push the plain objects into newChannel.users
        this.newChannel.users?.push(...usersAsPlainObjects);

        //  this.newChannel.users?.push(...this.allUsers);
        this.onAddChannel();
      }
    }
}
