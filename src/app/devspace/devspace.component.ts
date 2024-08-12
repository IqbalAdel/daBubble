import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../main/header/header.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { Router } from '@angular/router';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent, GroupChatComponent],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss'
})
export class DevspaceComponent {
  firestore: Firestore = inject(Firestore);
  users$: Observable<any[]>;
  channels$: Observable<any[]>;

  constructor(private router: Router, private firebase:FirebaseService) {
    const fireUsers = collection(this.firestore, 'users');
    this.users$ = collectionData(fireUsers).pipe(
      map(users => users.sort((a, b) => a['name'].localeCompare(b['name'])))
    );

    const fireChannels = collection(this.firestore, 'channels');
    this.channels$ = collectionData(fireChannels).pipe(
      map(channels => channels.sort((a, b) => a['channel'].localeCompare(b['channel'])))
    );
  }

  showFiller = false;
  openEmployees = true;
  openChannels = true;
  isDavspaceVisible = true;
  imgSrc = ['assets/GroupClose.png', 'assets/Hide-navigation.png'];

  devspaceCloseOpen() {
    this.isDavspaceVisible = !this.isDavspaceVisible;
  }

  closeDirectMessages() {
    this.openEmployees = !this.openEmployees;
  }

  closeChannels() {
    this.openChannels = !this.openChannels
  }

  changeImage(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/groupCloseBlue.png' : 'assets/GroupClose.png';
  }

  changeImageTwo(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/Hide-navigation-blue.png' : 'assets/Hide-navigation.png';
  }

  openGroupChat(channel: any): void {
  if (channel && channel.id && channel.name) {
    this.router.navigate(['/group-chat', channel.id, channel.name]);
  } else {
    console.error('Invalid channel data:', channel);
  }
}
}
