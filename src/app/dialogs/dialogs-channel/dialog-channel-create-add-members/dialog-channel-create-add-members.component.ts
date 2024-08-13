import { Component, Inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../../../models/channel.class';
import { FirebaseService } from '../../../services/firebase.service';


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
export class DialogChannelCreateAddMembersComponent {

  imgSrc: string = "assets/img/close_default.png";
  inputState: string = 'hidden';
  selectedValue: string = 'option1';

  public name: string;
  public description: string;
  newChannel = new Channel();

  constructor(
    public dialog: MatDialogRef<DialogChannelCreateAddMembersComponent>,
    private fire: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      name: string; 
      description: string; 
      channel: Channel;
       }
  ) {
    this.name = data.name;
    this.description = data.description;
    this.newChannel.name = data.name; 
    this.newChannel.description = data.description; 

    console.log('Empfangene Daten:', this.name, this.description,);
  }  

  async onAddChannel() {
    try {
      await this.fire.addChannel(this.newChannel);
      // this.dialog.close();

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
        this.onAddChannel();
      }
    }
}
