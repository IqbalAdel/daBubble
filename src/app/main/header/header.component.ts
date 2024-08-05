import { Component } from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule, MatDialogRef, MatDialog} from '@angular/material/dialog';
import { DialogProfileMenuComponent } from '../../dialogs/dialog-profile-menu/dialog-profile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIcon,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor( public dialog: MatDialog) {    
  }

  // closeDialog(){
  //   this.dialog.close();
  // }

  openDialog(){
    let dialogRef = this.dialog.open(DialogProfileMenuComponent, {
      panelClass: 'my-small-dialog',
      width: '200px',
      height: '130px',
      position: {top: '80px', right: '10px'},

    });
  }
  
}
