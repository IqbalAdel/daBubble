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
})

export class DialogChannelEditComponent {
  edit = true;

  imgSrc: string = "assets/img/close_default.png";

  constructor(public dialog: MatDialogRef<DialogChannelEditComponent>) {
  }


  closeDialog() {
    this.dialog.close();
  }


  editOne() {
    this.edit = !this.edit;
  }
}
