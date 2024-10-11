import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private auth = inject(Auth);
  user: User = new User(); 
  isPrivacyChecked: boolean = false;
  emailExistsError: boolean = false;
  isVisible: boolean = true;
  isPasswordFocused: boolean = false;
  isEmailFocused: boolean = false;
  isNameFocused: boolean = false;
  constructor(private router: Router, private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {

  }

  async onSubmit(): Promise<void> {
    if (this.isFormValid()) {
      try {
        const emailExists = await this.authService.checkEmailExists(this.user.email);
        if (emailExists) {
          this.emailExistsError = true; 
          return;
        } else {
          this.emailExistsError = false;
        }
        this.userService.setUser(this.user);
        this.router.navigate(['/create-avatar']);
      } catch (error) {
        console.error('Fehler bei der Registrierung:', error);
      }
    } else {
      console.warn('Formular ist nicht gültig');
    }
  }

 
  isFormValid(): boolean {
    return this.user.name.trim() !== '' &&
      this.user.email.trim() !== '' &&
      this.user.password.trim() !== '' &&
      this.isPrivacyChecked;
  }

}