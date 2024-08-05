import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-section',
  standalone: true,
  imports: [MatCardModule,RouterModule, CommonModule, RouterOutlet ],
  templateUrl: './login-section.component.html',
  styleUrl: './login-section.component.scss'
})
export class LoginSectionComponent {
  isVisible: boolean = true;

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
