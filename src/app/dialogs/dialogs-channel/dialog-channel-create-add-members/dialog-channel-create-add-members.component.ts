import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
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
import { ChipsAddMembersComponent } from '../../../chips/chips-add-members/chips-add-members.component';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-dialog-channel-create-add-members',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    FormsModule,
    ChipsAddMembersComponent,
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
    public dialog: MatDialogRef<DialogChannelCreateAddMembersComponent>,
    private fire: FirebaseService,
    private userService: UserService,
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
          data['id'] || '', 
          data['img'] || '',
          data['password'] || '',
          data['channels'] || [],
          data['chats'] || []
        );
      });
    });
  }  

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const screenWidth = window.innerWidth;
    if(screenWidth < 992){
      this.dialog.close();
    }
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


  closeDialog(){
    this.dialog.close();
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
      this.closeDialog()

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
