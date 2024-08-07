import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../main/header/header.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { Router } from '@angular/router';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent, GroupChatComponent],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss'
})
export class DevspaceComponent {
  firestore: Firestore = inject(Firestore);
  items$: Observable<any[]>;

  constructor(private router: Router) {
    this.sortEmployees();
    this.sortGroupChats();
    const aCollection = collection(this.firestore, 'users')
    this.items$ = collectionData(aCollection);
  }

  groupChats = [
    { id: 1, name: 'Entwicklerteam' },
    { id: 2, name: 'Vertieb' },
    { id: 3, name: 'Marketing' },
  ]

  showFiller = false;
  openEmployees = true;
  openChannels = true;
  isDavspaceVisible = true;
  imgSrc = ['assets/GroupClose.png', 'assets/Hide-navigation.png'];

  sortEmployees() {
    // this.employees.sort((a, b) => a.name.localeCompare(b.name));
  }

  sortGroupChats() {
    this.groupChats.sort((a, b) => a.name.localeCompare(b.name));
  }

  devspaceCloseOpen() {
    this.isDavspaceVisible = !this.isDavspaceVisible;
  }

  closeDirectMessages() {
    this.openEmployees = !this.openEmployees;
  }

  closeChannels() {
    this.openChannels = !this.openChannels
  }

  openGroupChat(groupChat: { id: number, name: string }): void {
    this.router.navigate(['/group-chat', groupChat.id, groupChat.name]);
  }

  changeImage(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/groupCloseBlue.png' : 'assets/GroupClose.png';
  }

  changeImageTwo(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/Hide-navigation-blue.png' : 'assets/Hide-navigation.png';
  }

}
