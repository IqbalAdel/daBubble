import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule, MatDialogRef, MatDialog} from '@angular/material/dialog';
import { DialogProfileMenuComponent } from '../../dialogs/dialog-profile-menu/dialog-profile-menu.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  imgSrc:string ="assets/img/keyboard_arrow_down_v2.png";

  constructor( public dialog: MatDialog) {    
  }

  // closeDialog(){
  //   this.dialog.close();
  // }

  openDialog(){
    let dialogRef = this.dialog.open(DialogProfileMenuComponent, {
      panelClass: 'profile-menu',
      width: '200px',
      height: '130px',
      position: {top: '90px', right: '15px'},

    });
  }
  
}
