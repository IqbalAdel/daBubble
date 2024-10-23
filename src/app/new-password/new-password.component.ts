import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent implements OnInit {
  constructor( 
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) {}

    newPassword: string = '';
    confirmPassword: string = '';
    message: string = '';
    oobCode: string | null = null;
    isPasswordFocused: boolean = false;
    isNewPasswordFocused: boolean = false;

    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        this.oobCode = params['oobCode'];
      });
    }

    setFocus(field: string): void {
      if (field === 'password') {
        this.isPasswordFocused = true;
      } else if (field === 'confirmPassword') {
        this.isNewPasswordFocused = true;
      }
    }
  
    // Handle das Blur-Ereignis für beide Felder
    onBlur(field: string, value: string): void {
      if (!value) {  // Prüft, ob das entsprechende Feld leer ist
        if (field === 'password') {
          this.isPasswordFocused = false;  // Placeholder für "Neues Passwort"
        } else if (field === 'confirmPassword') {
          this.isNewPasswordFocused = false;  // Placeholder für "Neues Passwort bestätigen"
        }
      }
    }


    resetPassword() {
      if (this.newPassword === this.confirmPassword && this.oobCode) {
        this.authService.newPassword(this.oobCode, this.newPassword)
          .then(() => {
            this.message = 'Passwort erfolgreich zurückgesetzt.';
            console.log('passwort neu gespeichert')
            this.router.navigate(['login']); 
          })
          .catch(error => {
            this.message = `Fehler beim Zurücksetzen des Passworts: ${error.message}`;
          });
      } else {
        this.message = 'Die Passwörter stimmen nicht überein.';
      }
    }

}
