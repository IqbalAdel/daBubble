import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service';
import { Firestore, collection, addDoc, setDoc, doc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
@Component({
  selector: 'app-create-avatar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LoginComponent, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './create-avatar.component.html',
  styleUrl: './create-avatar.component.scss'
})
export class CreateAvatarComponent {
  user!: User;
  auth: Auth = inject(Auth);
  avatars: string[] = [
    'assets/img/avatar-1.png',
    'assets/img/avatar-2.png',
    'assets/img/avatar-3.png',
    'assets/img/avatar-4.png',
    'assets/img/avatar-5.png',
    'assets/img/avatar-6.png'
  ];
  firestore: Firestore = inject(Firestore);

  selectedAvatar: string = 'assets/img/person.png';
  constructor(private http: HttpClient, private router: Router, private userService: UserService) { }



  ngOnInit(): void {
    this.user = this.userService.getUser()!;
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.user = navigation.extras.state['user'] as User;

      if (this.user) {
        console.log('Benutzerdaten geladen:', this.user);
        // Optional: Setze das Avatar-Bild, falls das bereits festgelegt wurde
        if (this.user.img) {
          this.selectedAvatar = this.user.img;
        }
      } else {
        console.warn('Keine Benutzerdaten gefunden!');
      }
    }
  }

  selectAvatar(avatarSrc: string): void {
    this.selectedAvatar = avatarSrc;
    this.user.img = avatarSrc;
  }
  selectedFile: File | null = null;


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
  isFormValid(): boolean {
    return this.user.img.trim() !== '';
  }

  private cleanUserData(user: any): any {
    // Stelle sicher, dass keine sensiblen Daten wie Passwörter gespeichert werden
    return {
      name: user.name || '',
      email: user.email || '',
      img: user.img || '',
      channels: user.channels || [],
      chats: user.chats || []
    };
  }
 async saveUser() {
    // Bereinige die Benutzerdaten, um nur die relevanten Informationen zu speichern
    const cleanedUserData = this.cleanUserData(this.user);

    try {
        // Schritt 1: Benutzer in Firebase Authentication erstellen
        const userCredential = await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password);

        if (userCredential.user) {
            // Schritt 2: Benutzer-ID (UID) aus Firebase Authentication abrufen
            const uid = userCredential.user.uid;

            // Schritt 3: Benutzer-ID zum bereinigten Benutzerobjekt hinzufügen (optional)
            cleanedUserData.id = uid;

            // Schritt 4: Benutzer in Firestore unter der UID speichern
            const docRef = doc(this.firestore, 'users', uid);
            await setDoc(docRef, cleanedUserData);

            console.log('User added with ID: ', uid);
        }
    } catch (e) {
        console.error('Error creating or updating user: ', e);
    }
}



}




