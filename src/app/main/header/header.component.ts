import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import { ChatComponent } from '../../chat/chat.component';
import { FilterGroup } from '../../new-message/new-message.component';
import { map, Observable, of, startWith, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, CommonModule } from '@angular/common';

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
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    CommonModule,
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
    state: 'offline',
    lastChanged: Date.now(),
    usersToJSON: function (): { name: string; email: string; id: string; img: string; password: string; channels: string[]; chats: string[]; } {
      throw new Error('Function not implemented.');
    }
  };

  imgSrc:string ="assets/img/keyboard_arrow_down_v2.png";
  users: User[] = [];
  test!: boolean;
  // userStatus: any;
  onlineStaus: boolean = false;



  constructor( 
    public dialog: MatDialog,
    private firebaseService: FirebaseService,
    public userService: UserService,
    private firestore: Firestore,
  ) {}


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

      // Fetch users and channels from Firestore
      this.users$ = this.firebaseService.getUsers();
      this.channels$ = this.firebaseService.getChannels();
  
      this.filterGroupOptions = this.searchFieldControl.valueChanges.pipe(
        startWith(''),
        switchMap(value => this._filterData(value || ''))
      ) ?? of([]); 
  
      this.searchFieldControl.valueChanges.subscribe(selectedId => {
        if (typeof selectedId === 'string') {
          console.log('Selected ID:', selectedId);
          // Handle the selected ID as needed
        }
      });
  }


  // ------------

  private _formBuilder = inject(FormBuilder);
 
  stateForm = this._formBuilder.group({
    searchField: '', // Use searchField for the input field
  });

  filterGroups: FilterGroup[] = []; // To store the filter group results
  filterGroupOptions: Observable<FilterGroup[]> = new Observable(); // Observable to hold filtered data

  users$: Observable<User[]> = new Observable(); // Users from Firebase
  channels$: Observable<Channel[]> = new Observable(); // Channels from Firebase

   // Getter for the 'searchField' form control
   get searchFieldControl(): FormControl {
    return this.stateForm.get('searchField') as FormControl;
  }

  // Filter function to handle both Users and Channels
  private _filterData(value: string): Observable<FilterGroup[]> {
    const filterValue = value // Convert input to lowercase for case-insensitive search
  
    return this.users$.pipe(
      switchMap(users =>
        this.channels$.pipe(
          map(channels => {
            const filteredUsers = users
              .filter(user => user.name.toLowerCase().includes(filterValue)) // Filter users by name
              .filter(user => !!user.id); // Ensure only users with an ID are included
  
            const filteredChannels = channels
              .filter(channel => channel.name.toLowerCase().includes(filterValue)) // Filter channels by name
              .filter(channel => !!channel.id); // Ensure only channels with an ID are included
  
            return [
              {
                type: 'Users',
                items: filteredUsers.map(user => ({ name: user.name, id: user.id!, img: user.img })) // Map user with name and id
              },
              {
                type: 'Channels',
                items: filteredChannels.map(channel => ({ name: channel.name, id: channel.id!, img: "" })) // Map channel with name and id
              }
            ];
          })
        )
      )
    );
  }


  onOptionSelected(event: any) {
    const selectedItem = event.option.value;  // Get the selected item object
    const selectedName = selectedItem.name;   // Extract the name
    const selectedId = selectedItem.id;       // Extract the ID

    this.searchFieldControl.setValue(selectedName, { emitEvent: false });

    // Update form control or handle selectedId as needed
    console.log('Selected ID:', selectedItem.img);
  }


  // ------------


  async getActiveUser(){
    try {
      // UID des aktuell angemeldeten Benutzers abrufen
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        // Benutzerdaten anhand der UID laden
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        this.firebaseService.setOnlineStatus(uid);
        console.log('status was set')
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
