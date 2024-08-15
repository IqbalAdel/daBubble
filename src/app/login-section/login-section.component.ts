import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login-section',
  standalone: true,
  imports: [MatCardModule,RouterModule, CommonModule, RouterOutlet, FormsModule ],
  templateUrl: './login-section.component.html',
  styleUrl: './login-section.component.scss'
})
export class LoginSectionComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  async onLogin(): Promise<void> {
    if (this.email && this.password) {
      try {
        const user = await this.authService.signIn(this.email, this.password);
        if (user) {
          this.router.navigate(['/main']); // Ändere die Route, falls nötig
        }
      } catch (error) {
        this.errorMessage = 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.';
      }
    } else {
      this.errorMessage = 'Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.';
    }
  }
 
}
