import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule, RouterModule],
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
