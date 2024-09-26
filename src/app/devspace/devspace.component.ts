import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent, GroupChatComponent, RouterModule, RouterLink, HttpClientModule],
  templateUrl: './devspace.component.html',
  styleUrls: ['./devspace.component.scss'] // corrected styleUrl to styleUrls
})
export class DevspaceComponent implements OnInit{
  firestore: Firestore = inject(Firestore);
  users$: Observable<any[]>;
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

  selectedUserId: string | null = null; // Variable to track the selected user
  userStatus: { [key: string]: boolean } = {};
  userStatusFetched: { [userId: string]: boolean } = {};


  constructor(
    private router: Router,
    public userServes: UserService,
    private firebaseService: FirebaseService,
    private userService: UserService,
    private dialog: MatDialog,
  ) {
    const fireUsers = collection(this.firestore, 'users');
    this.users$ = collectionData(fireUsers).pipe(
      map(users => {
        // Der aktuell eingeloggte Benutzername (Beispiel: aus einer anderen Quelle)
        const loggedInUserName = this.loggedInUserName;
    
        // Sortiere so, dass der eingeloggte Benutzer oben steht und die anderen alphabetisch sortiert werden
        return users.sort((a, b) => {
          if (a['name'] === loggedInUserName) return -1; // Zeigt den eingeloggten User als ersten an
          if (b['name'] === loggedInUserName) return 1;
          
          // Fallunabhängige alphabetische Sortierung der restlichen Benutzer
          return a['name'].toLowerCase().localeCompare(b['name'].toLowerCase());
        });
      })
    );

    const fireChannels = collection(this.firestore, 'channels');
    this.channels$ = collectionData(fireChannels).pipe(
      map(channels => channels.sort((a, b) => a['name'].localeCompare(b['name'])))
    );

    this.loadUsers();
    // this.selectUser;
    this.loggedInUser();

  }


  getUsers$(): Observable<any[]> {
    const fireUsers = collection(this.firestore, 'users');
    return collectionData(fireUsers).pipe(
      map(users => {
        // Sortiere so, dass der eingeloggte Benutzer oben steht und die anderen alphabetisch sortiert werden
        return users.sort((a, b) => {
          if (a['name'] === this.loggedInUserName) return -1; // Zeigt den eingeloggten User als ersten an
          if (b['name'] === this.loggedInUserName) return 1;

          // Fallunabhängige alphabetische Sortierung der restlichen Benutzer
          return a['name'].toLowerCase().localeCompare(b['name'].toLowerCase());
        });
      })
    );
  }

  async ngOnInit(): Promise<void>{
    await this.getActiveUser();

    // if(this.currentUser && this.currentUser.channels){
    //   this.firebaseService.getChannels().subscribe((channels) => {
    //     this.currentUserChannels = channels.filter(channel =>{
    //       const channelId = channel['id']
    //       return channelId && this.currentUser.channels!.includes(channelId)
    //     })
        	  
    //   })
      
    // };

  }
  
  async loggedInUser() {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; // Setze den Namen des eingeloggten Benutzers
          
          
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
    this.userService.setSelectedUserId(userId); // Set the selected user ID in the service
    this.router.navigate(['/main/chat', userId]);
    this.selectedChannelId = null;
    this.userServes.showGroupAnswer = false;
  }


  selectChannel(channel: any) {
    this.selectedChannelId = channel.id;
    this.userServes.setSelectedChannelName(channel.name); // Setze den Channel-Namen im Service
    this.openGroupChat(channel); // Öffnet den Gruppenchat für den ausgewählten Channel
    this.selectedUserId = null;
    this.userService.showGroupAnswer = false;
    
  }

  openSoloChat(userId: string): void {
    this.router.navigate(['/main/chat', userId]);
  }

  openDialog() {
    let dialogRef = this.dialog.open(DialogChannelCreateComponent, {
      panelClass: 'border-30',
      width: '700px',
      height: '400px',
    });
  }

 

  navigateRouteChannel(id: string) {
    if(id){
      this.router.navigate(['/main/group-chat', id]);
    }
  }


  loadUsers() {
    const usersRef = this.firebaseService.getUsersRef();  // Holt die Referenz der Benutzer-Sammlung
    collectionData(usersRef).subscribe((users: DocumentData[]) => {
      users.forEach(user => {
        // console.log('User Name:', user['name']);  // Logge den Namen jedes Benutzers
      });
    });
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
          this.currentUser = new User(user);
        }
      
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }
}