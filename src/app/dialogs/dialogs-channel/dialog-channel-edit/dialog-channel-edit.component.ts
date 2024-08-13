import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-channel-edit',
  standalone: true,
  imports: [
    MatCard,
    CommonModule,
  ],
  templateUrl: './dialog-channel-edit.component.html',
  styleUrls: ['./dialog-channel-edit.component.scss'],
  animations: [
    trigger('divFadeOut', [
      state('in', style({
        opacity: 1,
        height: '*'
      })),
      state('out', style({
        opacity: 0,
        height: 0,
        overflow: 'hidden'
      })),
      transition('in => out', animate('600ms ease-in-out'))
    ]),
    trigger('spanSlide', [
      state('start', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('end', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('start => end', animate('600ms ease-in-out'))
    ]),
    trigger('inputAppear', [
      state('hidden', style({
        opacity: 0,
      })),
      state('visible', style({
        opacity: 1,
      })),
      transition('hidden => visible', [
        style({ opacity: 0 }),
        animate('225ms ease-in-out', style({ opacity: 1 }))
      ])
    ]),
  ],
})

export class DialogChannelEditComponent {

  divState: string = 'in';
  spanState: string = 'start';
  inputState: string = 'hidden';

  animate() {
    this.spanState = 'end';
    this.divState = 'out';

    setTimeout(() => {
      this.inputState = 'visible';
    }, 600); // delay to ensure input appears after div fades out
  }

  imgSrc: string = "assets/img/close_default.png";

  constructor( public dialog: MatDialogRef<DialogChannelEditComponent> ) {    
  }


  closeDialog(){
    this.dialog.close();
    this.inputState = 'hidden';
  }
}
