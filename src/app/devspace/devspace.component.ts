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
  employees = [
    { name: 'Max Mustermann', picture: 'assets/Avatar.png' },
    { name: 'Klaus Weber', picture: 'assets/00c.Charaters.png' }
  ];

  groupChats = [
    {name:'Entwicklerteam'},
    {name:'Test'}
  ]

  showFiller = true;
  openEmployees = true;
  openChannels = true;


  closeDirectMessages() {
    this.openEmployees = !this.openEmployees;
  }

  closeChannels() {
    this.openChannels = !this.openChannels
  }

}
