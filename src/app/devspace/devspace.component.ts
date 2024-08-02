import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [MatSidenavModule,CommonModule],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss'
})
export class DevspaceComponent {
  employees = [
    { name: 'Max Mustermann', picture: 'assets/Avatar.png' },
    { name: 'Klaus Weber', picture: 'assets/00c.Charaters.png' }
  ];

  showFiller = true;
  openEmployees = true;


  closeDirectMessages(){
  this.openEmployees  = !this.openEmployees;
  }

}
