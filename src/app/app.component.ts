import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { DevspaceComponent } from "./devspace/devspace.component";
<<<<<<< HEAD
import { MainComponent } from './main/main.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule, RouterLink, DevspaceComponent, MainComponent],
=======
import { MatIcon, MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MatCardModule, 
    RouterLink, 
    DevspaceComponent,
  ],
>>>>>>> fa7127f689e3d4fb8ca657f85fa50054df8bbc4c
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 
  title = 'daBubble';
  constructor(private router: Router) { }
  

}
