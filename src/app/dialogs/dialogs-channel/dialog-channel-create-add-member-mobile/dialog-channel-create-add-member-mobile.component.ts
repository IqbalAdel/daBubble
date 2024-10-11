import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { ChipsAddMembersComponent } from '../../../chips/chips-add-members/chips-add-members.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { arrayUnion, writeBatch } from 'firebase/firestore';

@Component({
  selector: 'app-dialog-channel-create-add-member-mobile',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
    FormsModule,
    ChipsAddMembersComponent,
  ],
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
  templateUrl: './dialog-channel-create-add-member-mobile.component.html',
  styleUrl: './dialog-channel-create-add-member-mobile.component.scss'
})
export class DialogChannelCreateAddMemberMobileComponent {

  imgSrcClose = 'assets/img/close_default.svg'

  @Output() closeAddMenu: EventEmitter<void> = new EventEmitter<void>();
  @Output() successAdd: EventEmitter<void> = new EventEmitter<void>();

  closeDialogAddMember(){
    this.closeAddMenu.emit();
  }

  @ViewChild(ChipsAddMembersComponent) chipsAddMembersComponent!: ChipsAddMembersComponent;


  imgSrc: string = "assets/img/close_default.svg";
  inputState: string = 'hidden';
  selectedValue: string = '';
  newChannel = new Channel();

  allUsers: User[] = [];
  user: User = {
    name: 'Frederick Beck',
    email: 'Test@gmx.de',
    id: '',
    img: 'assets/img/profiles/boy.png',
    password: '',
    channels: [],
    chats: [],
    state: 'offline',
    lastChanged: Date.now(),
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };
  userId: string = "";


  constructor(
    private fire: FirebaseService,
    private userService: UserService,
    private route: ActivatedRoute,
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

  async ngOnInit(): Promise<void> {
    try {
      
      const uid = await this.fire.getCurrentUserUid();
      if (uid) {
     
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        if(user){
          this.user = user;
          this.newChannel.creator = this.user.name; 
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }



  

  async onAddChannel() {
    try {

      const newChannelRef = await this.fire.addChannel(this.newChannel);
      if (!newChannelRef) {
        throw new Error('Failed to get DocumentReference for the new channel.');
    }
      const newChannelId = newChannelRef.id;

      console.log('New Channel ID:', newChannelId);
      if(this.selectedValue === "option1"){
        const batch = writeBatch(this.fire.getFirestore());
        this.allUsers.forEach(user => {
          if (user.id) {
            const userDocRef = this.fire.getUserDocRef(user.id);
  
            batch.update(userDocRef, {
                channels: arrayUnion(newChannelId)
            });
        } else {
            console.warn('User ID is undefined. Skipping update for user:', user);
        }
        });
  
        await batch.commit();
  
      } else if(this.selectedValue === "option2"){
        await this.addChannelToUser(newChannelId);
      }

  } catch (error) {
      console.error('Failed to add channel:', error);
    }
  }


    onRadioChange(value: string) {
      this.selectedValue = value;
      if (this.selectedValue === 'option1') {
      } else if (this.selectedValue === 'option2') {
      }
    }
  
    onSubmit(): void {
      if (this.selectedValue === "option1") {
        const userIDs = this.allUsers
        .map(user => user.id)
        .filter((id): id is string => id !== undefined);
        console.log(userIDs)
        
        this.newChannel.users?.push(...userIDs);
        this.onAddChannel();
      } else if(this.selectedValue === 'option2'){
        const users: User[] = this.chipsAddMembersComponent.users();
        if (users.length > 0) {
          const selectedUser = users[0]; 
          if(selectedUser.id){
            this.userId = selectedUser.id; 
          }
        }
        
        this.newChannel.users?.push(this.userId);
        this.onAddChannel();
      }
      this.successAdd.emit();

    }

    async addChannelToUser(newChannelId: string){
      if (this.userId.length>0 && newChannelId.length>0) {
        try {
          await this.fire.updateUserChannels(this.userId, newChannelId);
        } catch (error) {
          console.error('Failed to update user channels:', error);
        }
      } else {
        console.error('No user selected or user ID is missing.');
      }
    }
}
