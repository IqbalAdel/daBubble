import { Component, Inject, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../../../models/channel.class';
import { FirebaseService,  } from '../../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, doc, updateDoc, arrayUnion, writeBatch } from '@angular/fire/firestore';


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
    try {
      // Add the new channel to the 'channels' collection and retrieve its ID
      const newChannelRef = await this.fire.addChannel(this.newChannel);
      if (!newChannelRef) {
        throw new Error('Failed to get DocumentReference for the new channel.');
    }
      const newChannelId = newChannelRef.id;

      console.log('New Channel ID:', newChannelId);
      const batch = writeBatch(this.fire.getFirestore());

      this.allUsers.forEach(user => {
        if (user.id) {
          const userDocRef = this.fire.getUserDocRef(user.id);

          // Add the new channel ID to the user's channels array
          batch.update(userDocRef, {
              channels: arrayUnion(newChannelId)
          });
      } else {
          console.warn('User ID is undefined. Skipping update for user:', user);
      }
      });

      // Commit the batch
      await batch.commit();

      console.log('Channel added and users updated successfully.');

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
