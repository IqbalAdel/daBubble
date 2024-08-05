import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-create-avatar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LoginComponent],
  templateUrl: './create-avatar.component.html',
  styleUrl: './create-avatar.component.scss'
})
export class CreateAvatarComponent {
  constructor(private router: Router){}
}
