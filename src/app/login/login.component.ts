import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isVisible: boolean = true;
  constructor(private router: Router) { }
  
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Überprüfe den aktuellen Router-Link und setze den Zustand entsprechend
        if (this.router.url === '/' ) {  // Passe die Route hier an
          this.isVisible = true;
        } else {
          this.isVisible = false;
        }
      }
    });
  }
}
