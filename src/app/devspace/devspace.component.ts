import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../main/header/header.component';
<<<<<<< HEAD
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { Router } from '@angular/router';
=======
import { MatIcon } from '@angular/material/icon';

>>>>>>> fa7127f689e3d4fb8ca657f85fa50054df8bbc4c
@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent, GroupChatComponent],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss'
})
export class DevspaceComponent {
  constructor( private router: Router) {
    this.sortEmployees();
    this.sortGroupChats();
  }

  employees = [
    { name: 'Max Mustermann', picture: 'assets/Avatar.png' },
    { name: 'Klaus Weber', picture: 'assets/00c.Charaters.png' },
    { name: 'Andreas Pflaum', picture: 'assets/00c.Charaters.png' }
  ];

  groupChats = [
    { id: 1, name: 'Entwicklerteam' },
    { id: 2, name: 'Vertieb' },
    { id: 3, name: 'Marketing' },
  ]

  showFiller = false;
  openEmployees = true;
  openChannels = true;
  isDavspaceVisible = true;

  sortEmployees() {
    this.employees.sort((a, b) => a.name.localeCompare(b.name));
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
  

}
