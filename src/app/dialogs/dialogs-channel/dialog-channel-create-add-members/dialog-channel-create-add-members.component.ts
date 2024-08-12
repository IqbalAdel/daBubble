import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor( public dialog: MatDialogRef<DialogChannelCreateAddMembersComponent> ) {    
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
  
    processSelection() {
      
    }
}
