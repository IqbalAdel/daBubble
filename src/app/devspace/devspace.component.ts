import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, OnInit, Output } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../main/header/header.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { collection, collectionData, DocumentData, Firestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { User } from '../../models/user.class';
import { FirebaseService } from '../services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelCreateComponent } from '../dialogs/dialogs-channel/dialog-channel-create/dialog-channel-create.component';
import { Channel } from '../../models/channel.class';
import { HttpClientModule } from '@angular/common/http';
import { SearchBarComponent } from '../main/header/search-bar/search-bar.component';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent, GroupChatComponent, RouterModule, RouterLink, HttpClientModule, SearchBarComponent],
  templateUrl: './devspace.component.html',
  styleUrls: ['./devspace.component.scss'] 
})
export class DevspaceComponent implements OnInit{
  firestore: Firestore = inject(Firestore);
  users$: Observable<any[]> | null = null;
  channels$: Observable<any[]>;
  channelsIqbal: Channel[] = [];
  messages: any[] = [];
  selectedChatId: string | null = null;
  currentUser: User = {
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
  currentUserChannels: Channel[] = [];
  user: User | null = null;
  selectedChannelId: string | null = '';
  loggedInUserName!: string;
  showFiller = false;
  openEmployees = true;
  openChannels = true;
  isDavspaceVisible = true;
  showGroupChat = true;
  imgSrc = ['assets/GroupClose.svg', 'assets/Hide-navigation.svg'];
  imgEdit = 'assets/edit_square.svg'
  imgAdd='assets/img/add_circle.svg'
  imgAdd2='assets/img/add.svg'
  imgDropDown = "assets/arrow_drop_down.svg";
  imgDropDownRight = "assets/arrow_drop_down-right.svg";
  imgDropDown2 = "assets/arrow_drop_down.svg";
  imgDropDownRight2 = "assets/arrow_drop_down-right.svg";
  imgAccountCircle = "assets/account_circle.svg";
  imgAccountCircle2 = "assets/account_circle.svg";
  imgSendMsgBttn = "assets/sendMessage_default.svg";

  selectedUserId: string | null = null; 
  userStatus: { [key: string]: boolean } = {};
  userStatusFetched: { [userId: string]: boolean } = {};

  screenWidth: number;
  supportsTouch: boolean = false;
  @Output() isMobile: EventEmitter<void> = new EventEmitter<void>();
  @Output() navigateToChannel: EventEmitter<void> = new EventEmitter<void>();
  @Output() navigateToDirectChat: EventEmitter<void> = new EventEmitter<void>();
  @Output() navigateToNewMessage: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private router: Router,
    public userServes: UserService,
    private firebaseService: FirebaseService,
    private userService: UserService,
    private dialog: MatDialog,
  ) {
    this.screenWidth = window.innerWidth;
    const fireChannels = collection(this.firestore, 'channels');
    this.channels$ = collectionData(fireChannels).pipe(
      map(channels => channels.sort((a, b) => a['name'].localeCompare(b['name'])))
    );
    this.loadUsers();
    this.loggedInUser();
  }

  async getUsers$(): Promise<void> {
    const fireUsers = collection(this.firestore, 'users');
    this.users$ =  collectionData(fireUsers).pipe(
      map(users => {
        return users.sort((a, b) => {
          if (a['name'] === this.loggedInUserName) return -1; 
          if (b['name'] === this.loggedInUserName) return 1;
          return a['name'].toLowerCase().localeCompare(b['name'].toLowerCase());
        });
      })
    );
  }

  async ngOnInit(): Promise<void>{
    await this.getUsers$();
    await this.getActiveUser();
    this.screenWidth = window.innerWidth;
    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if(window.innerWidth <= 992){
      this.isMobile.emit();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if(window.innerWidth <= 992){
      this.isMobile.emit();
      this.isDavspaceVisible = true;
    }
  }
  
  async loggedInUser() {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; 
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  devspaceCloseOpen() {
    this.isDavspaceVisible = !this.isDavspaceVisible;
  }

  closeDirectMessages() {
    this.openEmployees = !this.openEmployees;
  }

  closeChannels() {
    this.openChannels = !this.openChannels;
  }

  changeImage(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/groupCloseBlue.svg' : 'assets/GroupClose.svg';
  }

  changeImageTwo(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/Hide-navigation-blue.svg' : 'assets/Hide-navigation.svg';
  }

  openGroupChat(name: any): void {
    this.userServes.groupChatOpen = true;
    if (name && name.id && name.name) {
      this.router.navigate(['/group-chat', name.id]);
    } else {
      console.error('Invalid channel data:', name);
    }
  }

  selectUser(userId: string): void {
    this.selectedUserId = userId;
    this.userService.setSelectedUserId(userId); 
    this.router.navigate(['/main/chat', userId]);
    if(this.supportsTouch || window.innerWidth <= 992){
      this.navigateToDirectChat.emit();
    }
    this.selectedChannelId = null;
    this.userServes.showGroupAnswer = false;
  }


  selectChannel(channel: any) {
    this.selectedChannelId = channel.id;
    this.userServes.setSelectedChannelName(channel.name); 
    this.openGroupChat(channel); 
    this.selectedUserId = null;
    this.userService.showGroupAnswer = false;
  }

  openSoloChat(userId: string): void {
    this.router.navigate(['/main/chat', userId]);
  }

  openDialog() {
    let dialogRef = this.dialog.open(DialogChannelCreateComponent, {
      panelClass: 'border-30',
    });
  }

  createChannel(){
    this.openDialog();
  }

  navigateRouteChannel(id: string) {
    if(id){
      this.router.navigate(['/main/group-chat', id]);
      if(this.supportsTouch || window.innerWidth <= 992){
        this.navigateToChannel.emit();
      }
    }
  }

  navigateRouteToNewMessage() {
    this.router.navigate(['/main/new-message']);
    if(window.innerWidth <= 992){
      this.navigateToNewMessage.emit();
    }
  }

  loadUsers() {
    const usersRef = this.firebaseService.getUsersRef();  
    collectionData(usersRef).subscribe((users: DocumentData[]) => {
      users.forEach(user => {
   
      });
    });
  }

  async getActiveUser(){
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        const user = this.userService.getUser();
        if(user){
          this.currentUser = new User(user);
        }    
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }
}