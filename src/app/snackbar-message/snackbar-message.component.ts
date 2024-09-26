import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar-message',
  standalone: true,
  imports: [],
  templateUrl: './snackbar-message.component.html',
  styleUrl: './snackbar-message.component.scss'
})
export class SnackbarMessageComponent {

  snackBarRef = inject(MatSnackBarRef);

  close(){
    this.snackBarRef.dismiss();
  }


}