import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  user: User = new User(); // Initialisiere das User-Objekt
  isPrivacyChecked: boolean = false;
  emailExistsError: boolean = false; 
  constructor(private router: Router, private userService: UserService, private authService: AuthService) { }
 
  // ngOnInit(): void {
  //   // Teste mit einer bekannten E-Mail-Adresse

  //   this.authService.checkEmailExists('dsfsdf@asd.de')
  //     .then(exists => {
       
  //       console.log('Existiert:', exists); // Sollte true sein, wenn die E-Mail bekannt ist
  //     })
  //     .catch(error => {
  //       console.error('Fehler beim Überprüfen:', error);
  //     });
  // }
 
  // Methode zur Validierung des Formulars
  isFormValid(): boolean {
    return this.user.name.trim() !== '' &&
      this.user.email.trim() !== '' &&
      this.user.password.trim() !== '' &&
      this.isPrivacyChecked;
  }
  onSubmit(): void {
    this.authService.checkEmailExists('marbach.a@gmx.net').then(exists => {
      console.log('Existiert:', exists); // Sollte true sein, wenn die E-Mail bekannt ist
    });
    if (this.isFormValid()) {
      // Überprüfen, ob die E-Mail bereits existiert
      this.authService.checkEmailExists(this.user.email)
        .then(exists => {
          if (exists) {
           
            // Wenn die E-Mail existiert, setze den Fehlerzustand
            this.emailExistsError = true;
          } else {
            
            // Wenn die E-Mail nicht existiert, setze den Benutzer und navigiere weiter
            this.emailExistsError = false;
            this.userService.setUser(this.user);
            this.router.navigate(['/create-avatar']);
          }
        })
        .catch(error => {
          console.error('Fehler bei der Überprüfung der E-Mail:', error);
        });
    } else {
      console.warn('Formular ist nicht gültig');
    }
  }


}