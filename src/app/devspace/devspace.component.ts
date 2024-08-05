import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../main/header/header.component';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule, CommonModule, HeaderComponent],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss'
})
export class DevspaceComponent {
  constructor() {
    this.sortEmployees();
    this.sortGroupChats();
  }

  employees = [
    { name: 'Max Mustermann', picture: 'assets/Avatar.png' },
    { name: 'Klaus Weber', picture: 'assets/00c.Charaters.png' },
    { name: 'Andreas Pflaum', picture: 'assets/00c.Charaters.png' }
  ];

  groupChats = [
    { name: 'Entwicklerteam' },
    { name: 'Vertieb' },
    { name: 'Marketing' },
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

}
