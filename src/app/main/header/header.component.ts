import { Component, ElementRef, EventEmitter, HostListener, inject, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule, MatDialogRef, MatDialog, MatDialogConfig} from '@angular/material/dialog';
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
import { combineLatest, debounceTime, distinctUntilChanged, map, Observable, of, startWith, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogProfileMobileMenuComponent } from '../../dialogs/dialog-profile-mobile-menu/dialog-profile-mobile-menu.component';
import { E } from '@angular/cdk/keycodes';
import { SearchBarComponent } from './search-bar/search-bar.component';

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
    SearchBarComponent

  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
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
  logo = ''
  supportsTouch!: boolean;
  @Output() openMobMenu: EventEmitter<void> = new EventEmitter<void>();
  @Output() userLeftChannel: EventEmitter<void> = new EventEmitter<void>();
  filterOpen = false;
  screenWidth: number = window.innerWidth;
 

  imgSrc:string ="assets/img/keyboard_arrow_down_v2.png";
  users: User[] = [];
  test!: boolean;
  // userStatus: any;
  onlineStaus: boolean = false;
  hasEnteredChannel: boolean = false;




  constructor( 
    public dialog: MatDialog,
    private firebaseService: FirebaseService,
    public userService: UserService,
    private firestore: Firestore,
    private router: Router,
    
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

  
  
  

      // // Fetch users and channels from Firestore
      // this.users$ = this.firebaseService.getUsers();
      // this.channels$ = this.firebaseService.getChannels();
  
      // this.filterGroupOptions = this.searchFieldControl.valueChanges.pipe(
      //   startWith(''), // Ensure an initial empty value to show all options at the start
      //   debounceTime(300), // Add debounce to reduce frequent API calls or filtering
      //   distinctUntilChanged(), // Avoid re-filtering if the input hasn't changed
      //   switchMap(value => this._filterData(value || '')) // Call filter function
      // );
  
      // this.searchFieldControl.valueChanges.subscribe(selectedId => {
      //   if (typeof selectedId === 'string') {
      //   this.filterOpen = true;
      //     console.log('Selected ID:', selectedId);
      //     // Handle the selected ID as needed
      //   }
      // });

    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      
    

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
    }


  // ------------

  // private _formBuilder = inject(FormBuilder);
 
  // stateForm = this._formBuilder.group({
  //   searchField: '', // Use searchField for the input field
  // });

  // filterGroups: FilterGroup[] = []; // To store the filter group results
  // filterGroupOptions: Observable<FilterGroup[]> = new Observable(); // Observable to hold filtered data

  // users$: Observable<User[]> = new Observable(); // Users from Firebase
  // channels$: Observable<Channel[]> = new Observable(); // Channels from Firebase

  //  // Getter for the 'searchField' form control
  //  get searchFieldControl(): FormControl {
  //   return this.stateForm.get('searchField') as FormControl;
  // }

  // // Filter function to handle both Users and Channels
  // private _filterData(value: string): Observable<FilterGroup[]> {
  //   const filterValue = (value || '').trim().toLowerCase();
  
  //   return combineLatest([this.users$, this.channels$]).pipe(
  //     map(([users, channels]) => {
  //       const filteredUsers = users
  //         .filter(user => user.name.toLowerCase().includes(filterValue)) // Filter users
  //         .filter(user => !!user.id); // Ensure only users with an ID are included
  
  //       const filteredChannels = channels
  //         .filter(channel => channel.name.toLowerCase().includes(filterValue)) // Filter channels
  //         .filter(channel => !!channel.id); // Ensure only channels with an ID are included
  
  //       return [
  //         {
  //           type: 'Users',
  //           items: filteredUsers.map(user => ({
  //             name: user.name,
  //             id: user.id!,
  //             img: user.img,
  //             type: 'Users'
  //           }))
  //         },
  //         {
  //           type: 'Channels',
  //           items: filteredChannels.map(channel => ({
  //             name: channel.name,
  //             id: channel.id!,
  //             img: "",
  //             type: 'Channels'
  //           }))
  //         }
  //       ];
  //     })
  //   );
  // }


  // onOptionSelected(event: any) {
  //   const selectedItem = event.option.value;  // Get the selected item object
    	
  //   const selectedName = selectedItem.name;   // Extract the name
  //   const selectedId = selectedItem.id;       // Extract the ID

  //   this.searchFieldControl.setValue(selectedName, { emitEvent: false });
  //   this.routeToSelectedItem(selectedItem)
  //   this.clearInputField();
  //   this.filterOpen = false;
  // }

  // routeToSelectedItem(selectedItem: any){
  //   if(selectedItem){
  //     switch (selectedItem.type) {
  //       case 'Users':
  //       this.userService.setSelectedUserId(selectedItem.id);
  //       this.router.navigate(['/main/chat', selectedItem.id]);  
  //         break;
      
  //       case 'Channels':
  //       this.router.navigate(['/main/group-chat', selectedItem.id]);  
  //         break;
  //     }
  //   }
  // }

  // clearInputField() {
  //   // Clear the input field by setting it to an empty string
  //   this.searchFieldControl.setValue('', { emitEvent: false });
  
  //   // Blur (remove focus) from the input field
  //   if (this.searchInput) {
  //     this.searchInput.nativeElement.blur();
  //   }
  // }

  // onFocus(): void {

  //   // Check if there's a value in the search field
  //   const currentValue = this.searchFieldControl.value;
    
  //   // If the input is focused, trigger the valueChanges to show the autocomplete options
  //   this.searchFieldControl.setValue(currentValue || '', { emitEvent: true });
  // }

  // changeBottom(){
  //   setTimeout(() => {
  //     this.filterOpen = true;
      
  //   }, 700);
  //   console.log(this.filterOpen)
  // }



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
        // console.log('status was set')
        if(user){
          this.user = new User(user);
          this.test = true;
        }
        
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  openProfileMenu(){
    if(window.innerWidth < 992){
      console.log('mobile')
      this.openDialogMobile();
    } else{
      this.openDialog();
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

  openDialogMobile(){
    this.openMobMenu.emit();
  }


  isMobile(){
    if((this.supportsTouch || window.innerWidth < 992) && this.hasEnteredChannel){
      return 'assets/Workspace.svg'
    } else{
      return 'assets/img/Logo.png'
    }

    
  }

  returnToDevSpace(){
    this.router.navigate(['/main/group-chat/pEylXqZMW1zKPIC0VDXL']);
    this.userLeftChannel.emit()
  }

  // onBlur(){
  //   setTimeout(() => {
  //     this.filterOpen = false;
  //   }, 90);

  // }
  
}
