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


  constructor(private router: Router) { }

 
}
