import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-create-avatar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LoginComponent, CommonModule, HttpClientModule],
  templateUrl: './create-avatar.component.html',
  styleUrl: './create-avatar.component.scss'
})
export class CreateAvatarComponent {

  avatars: string[] = [
    'assets/img/avatar-1.png',
    'assets/img/avatar-2.png',
    'assets/img/avatar-3.png',
    'assets/img/avatar-4.png',
    'assets/img/avatar-5.png',
    'assets/img/avatar-6.png'
  ];

  selectedAvatar: string = 'assets/img/person.png';

  selectAvatar(avatarSrc: string): void {
    this.selectedAvatar = avatarSrc;
  }
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // FileReader verwenden, um die Datei als Data URL zu lesen
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedAvatar = reader.result as string; // Setze die geladene Data URL als Avatar
      };
      reader.readAsDataURL(file);
    }
  }

 
}


