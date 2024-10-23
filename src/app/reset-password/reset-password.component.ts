import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getAuth, User } from 'firebase/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  email: string = '';
  message: string = '';
  user: User | null = null;
  isEmailFocused: boolean = false;

  constructor(private router: Router, private authService: AuthService) { 
    const auth = getAuth();
    this.user = auth.currentUser;
  }

  setFocusEmail(): void {
    this.isEmailFocused = true;
  }

  // Handle das Blur-Ereignis für das E-Mail-Feld
  onBlurEmail(): void {
    if (!this.email) {  // Prüft, ob das E-Mail-Feld leer ist
      this.isEmailFocused = false;  // Zeigt den Placeholder wieder an, wenn leer
    }
  }

  sendPasswordResetEmail() {
    this.authService.sendPasswordReset(this.email)
      .then(() => {
        this.message = 'Password reset email sent. Please check your inbox.';
      })
      .catch((error) => {
        this.message = `Error: ${error.message}`;
      });
  }


  isFormValid(): boolean {
    return this.email.trim() !== '';
  }

}
