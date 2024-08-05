import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  constructor(private router: Router, private userService: UserService) { }
  user: User = new User(); // Initialisiere das User-Objekt


  isPrivacyChecked: boolean = false;

  // Methode zur Validierung des Formulars
  isFormValid(): boolean {
    return this.user.name.trim() !== '' &&
      this.user.email.trim() !== '' &&
      this.user.password.trim() !== '' &&
      this.isPrivacyChecked;
  }
  onSubmit(): void {
    if (this.isFormValid()) {
      console.log('Formular gültig, Benutzer:', this.user);
      this.userService.setUser(this.user);
      this.router.navigate(['/create-avatar']);
    } else {
      console.warn('Formular ist nicht gültig');
    }
  }
}