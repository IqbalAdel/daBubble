import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from '../splash-screen/splash-screen.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule, RouterLink, SplashScreenComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  errorMessage: string = '';
  isVisible: boolean = true;
  showSplash = true;

  constructor(private router: Router) {}

  ngOnInit() {

    setTimeout(() => {
      this.showSplash = false;  // Splashscreen nach 5 Sekunden ausblenden
    }, 4800);  // 5000 ms = 5 Sekunden

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/' || this.router.url === '/login') {  
          this.isVisible = true;
        } else {
          this.isVisible = false;
        }
      }
    });
  }
}

