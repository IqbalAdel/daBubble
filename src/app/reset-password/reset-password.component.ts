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
  constructor(private router: Router, private authService: AuthService) { 
    const auth = getAuth();
    this.user = auth.currentUser;
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


  // resetPassword() {
  //   console.log('Reset password initiated for:', this.email); // Debugging
  //   this.authService.resetPassword(this.email)
  //     .then(() => {
  //       this.message = 'Password reset email sent. Check your inbox.';
  //     })
  //     .catch((error) => {
  //       this.message = `Error: ${error.message}`;
  //     });
  // }

}
