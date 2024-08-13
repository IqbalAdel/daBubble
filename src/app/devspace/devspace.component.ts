import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../main/header/header.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { Router } from '@angular/router';
import { collection, collectionData, DocumentData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { User } from '../../models/user.class';
import { FirebaseService } from '../services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelCreateComponent } from '../dialogs/dialogs-channel/dialog-channel-create/dialog-channel-create.component';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent, GroupChatComponent],
  templateUrl: './devspace.component.html',
  styleUrls: ['./devspace.component.scss'] // corrected styleUrl to styleUrls
})
export class DevspaceComponent {
  firestore: Firestore = inject(Firestore);
  users$: Observable<any[]>;
  channels$: Observable<any[]>;
  user = new User();
  
  showFiller = false;
  openEmployees = true;
  openChannels = true;
  isDavspaceVisible = true;
  showGroupChat = true;
  imgSrc = ['assets/GroupClose.png', 'assets/Hide-navigation.png'];
  
  selectedUserId: string | null = null; // Variable to track the selected user

  constructor(
    
    private router: Router, 
   
    
    public userServes: UserService,
    private firebaseService: FirebaseService,
    private userService: UserService 
  ,
    private dialog: MatDialog,
  ) {
    const fireUsers = collection(this.firestore, 'users');
    this.users$ = collectionData(fireUsers).pipe(
      map(users => users.sort((a, b) => a['name'].localeCompare(b['name'])))
    );

    const fireChannels = collection(this.firestore, 'channels');
    this.channels$ = collectionData(fireChannels).pipe(
      map(channels => channels.sort((a, b) => a['description'].localeCompare(b['description'])))
    );
    this.loadChannels();
    this.loadUsers();
    this.selectUser;
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
    this.imgSrc[0] = isHover ? 'assets/groupCloseBlue.png' : 'assets/GroupClose.png';
  }

  changeImageTwo(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/Hide-navigation-blue.png' : 'assets/Hide-navigation.png';
  }

  openGroupChat(name: any): void {
    this.userServes.groupChatOpen = true;
    if (name && name.id && name.name) {
      this.router.navigate(['/group-chat', name.id, name.name]);
    } else {
      console.error('Invalid channel data:', name);
    }
  }

  selectUser(userId: string): void {
    this.selectedUserId = userId;
    this.userService.setSelectedUserId(userId); // Set the selected user ID in the service
    this.userServes.groupChatOpen = false;
  }

  openSoloChat(channel: any): void {
    // Navigiere zur SoloChat-Komponente mit der ID des Kanals
    this.router.navigate(['/solo-chat', channel.id]);
  }

  openDialog(){
    let dialogRef = this.dialog.open(DialogChannelCreateComponent, {
      panelClass: 'border-30',
      width: '700px',
      height: '400px',
    });
  }
  


  loadChannels() {
    this.channels$ = this.firebaseService.getChannels();
    // Optional: Wenn du die Channels auch in der Konsole anzeigen möchtest:
    this.channels$.subscribe(channels => {
      console.log('Channels:', channels);
    });
  }
  
  loadUsers() {
    const usersRef = this.firebaseService.getUsersRef();  // Holt die Referenz der Benutzer-Sammlung
    collectionData(usersRef).subscribe((users: DocumentData[]) => {
      users.forEach(user => {
        console.log('User Name:', user['name']);  // Logge den Namen jedes Benutzers
      });
    });
  }
}

