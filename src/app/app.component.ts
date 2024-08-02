import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { DevspaceComponent } from "./devspace/devspace.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule, RouterLink, DevspaceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isVisible: boolean = true;
  title = 'daBubble';
  constructor(private router: Router) { }
  
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Überprüfe den aktuellen Router-Link und setze den Zustand entsprechend
        if (this.router.url === '/sign-up') {  // Passe die Route hier an
          this.isVisible = false;
        } else {
          this.isVisible = true;
        }
      }
    });
  }
}
