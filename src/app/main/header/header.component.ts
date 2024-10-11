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
  onlineStaus: boolean = false;
  hasEnteredChannel: boolean = false;

  constructor( 
    public dialog: MatDialog,
    private firebaseService: FirebaseService,
    public userService: UserService,
    private firestore: Firestore,
    private router: Router,
    
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getActiveUser();
    const uid = await this.firebaseService.getCurrentUserUid();
    if (uid) {
      const userDocRef = doc(this.firebaseService.firestore, 'users', uid);
      
      onSnapshot(userDocRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          console.log('User data changed, reloading user...');
          await this.getActiveUser();
        }
      });
    }
    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
  }

  async getActiveUser(){
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        this.firebaseService.setOnlineStatus(uid);
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
}
