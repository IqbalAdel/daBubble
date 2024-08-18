import { Component, OnInit } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule, MatDialogRef, MatDialog} from '@angular/material/dialog';
import { DialogProfileMenuComponent } from '../../dialogs/dialog-profile-menu/dialog-profile-menu.component';
import { MatCardModule } from '@angular/material/card';
import { FirebaseService } from '../../services/firebase.service';
import { User } from "./../../../models/user.class";
import { Channel } from '../../../models/channel.class';
import {MatSelectModule} from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { UserService } from '../../services/user.service';

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
    MatSelectModule,
    MatOptionModule,
    MatLabel,
    MatCardModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  user: User | null = null;
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  imgSrc:string ="assets/img/keyboard_arrow_down_v2.png";
  users: User[] = [];


  constructor( 
    public dialog: MatDialog,
    private firebaseService: FirebaseService,
    private userService: UserService
  ) {    

    // const fireUsers = fire.getUsers();
    // this.users = fireUsers.subscribe((list) => {
    //   list.forEach(element => {
    //     console.log(element)
    //   });
    // })
    
    // this.fire.getUsers().subscribe((list) => {
    //   this.users = list.map(element => {
    //     const data = element;
    //     return new User(
    //       data['name'] || '',
    //       data['email'] || '',
    //       data['id'] || '', // Falls `id` ein optionales Feld ist
    //       data['img'] || '',
    //       data['password'] || '',
    //       data['channels'] || [],
    //       data['chats'] || []
    //     );
    //   });
    //   console.log(this.users)
    // });  
  }
  async ngOnInit(): Promise<void> {
    try {
      // UID des aktuell angemeldeten Benutzers abrufen
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        // Benutzerdaten anhand der UID laden
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  openDialog(){
    let dialogRef = this.dialog.open(DialogProfileMenuComponent, {
      panelClass: 'profile-menu',
      width: '200px',
      height: '130px',
      position: {top: '90px', right: '15px'},

    });

  }

  
}
