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
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, setDoc, docData, DocumentData, CollectionReference, arrayUnion, writeBatch, DocumentReference } from '@angular/fire/firestore';

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
export class HeaderComponent implements OnInit{
  user: User = {
    name: '',
    email: 'Test@gmx.de',
    id: '',
    img: '',
    password: '',
    channels: [],
    chats: [],
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };

  imgSrc:string ="assets/img/keyboard_arrow_down_v2.png";
  users: User[] = [];
  test!: boolean;


  constructor( 
    public dialog: MatDialog,
    private firebaseService: FirebaseService,
    public userService: UserService,
    private firestore: Firestore,
  ) {    
 
  }
  async ngOnInit(): Promise<void> {
    await this.getActiveUser();

    const uid = await this.firebaseService.getCurrentUserUid();
    if (uid) {
      const userDocRef = doc(this.firebaseService.firestore, 'users', uid);
      
      // Set up the real-time listener
      onSnapshot(userDocRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          console.log('User data changed, reloading user...');
          await this.getActiveUser(); // Reload the user data when a change is detected
        }
      });
    }

    // if (this.user && this.user.id) {
    //   this.userService.subscribeToUserChanges(this.user.id, (updatedUser) => {
    //     this.user = updatedUser;
    //   });
    // }

    // const usersCollection = this.firebaseService.getUsersRef();

    // const userSub = onSnapshot(usersCollection, (snapshot) => {
    //   snapshot.docChanges().forEach((change) => {
    //     if (change.type === "modified") {
    //       let changedUser = change.doc.data();
    //       this.user.name = changedUser['name'];
    //     }
    //   });
    // });

    
  }

  async getActiveUser(){
    try {
      // UID des aktuell angemeldeten Benutzers abrufen
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        // Benutzerdaten anhand der UID laden
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        if(user){
          this.user = new User(user);
          this.test = true;
        }
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
