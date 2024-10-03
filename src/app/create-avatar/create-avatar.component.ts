import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { UserService } from '../services/user.service';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-create-avatar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './create-avatar.component.html',
  styleUrls: ['./create-avatar.component.scss']
})
export class CreateAvatarComponent implements OnInit {
  user!: User;
  Channel!: Channel;
  auth: Auth = inject(Auth);
  firestore: Firestore = inject(Firestore);
  storage: Storage = inject(Storage);

  avatars: string[] = [
    'assets/img/avatar-1.png',
    'assets/img/avatar-2.png',
    'assets/img/avatar-3.png',
    'assets/img/avatar-4.png',
    'assets/img/avatar-5.png',
    'assets/img/avatar-6.png'
  ];

  selectedAvatar: string = 'assets/img/person.png';
  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser()!;
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.user = navigation.extras.state['user'] as User;
      if (this.user) {
        console.log('Benutzerdaten geladen:', this.user);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
  
      // FileReader verwenden, um die Datei als Data URL zu lesen
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedAvatar = reader.result as string;
        this.user.img = this.selectedAvatar; // Setze das Bild auf das User-Objekt
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  isFormValid(): boolean {
    return this.user.img.trim() !== '' || this.selectedFile !== null;
  }
  
  private cleanUserData(user: any): any {
    return {
      name: user.name || '',
      email: user.email || '',
      img: user.img || '',
      channels: user.channels || [],
      chats: user.chats || []
    };
  }

  async saveUser() {
    const cleanedUserData = this.cleanUserData(this.user);

    const channelId = 'pEylXqZMW1zKPIC0VDXL'; // Die ID des Channels, zu dem der User hinzugefügt werden soll
    cleanedUserData.channels.push(channelId);

    try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password);

        if (userCredential.user) {
            const uid = userCredential.user.uid;
            cleanedUserData.id = uid;

            if (this.selectedFile) {
                const filePath = `avatars/${uid}/${this.selectedFile.name}`;
                const fileRef = ref(this.storage, filePath);
                await uploadBytes(fileRef, this.selectedFile);
                
                const downloadURL = await getDownloadURL(fileRef);
                cleanedUserData.img = downloadURL;
            }

            // Benutzer in der `users`-Sammlung speichern
            const userDocRef = doc(this.firestore, 'users', uid);
            await setDoc(userDocRef, cleanedUserData);
            console.log('User added with ID: ', uid);

            // Channel-Dokument aktualisieren, um den neuen Benutzer hinzuzufügen
            const channelDocRef = doc(this.firestore, 'channels', channelId);
            const channelDocSnap = await getDoc(channelDocRef);

            if (channelDocSnap.exists()) {
                const channelData = channelDocSnap.data() as Channel;
                const userIds = channelData.users || [];

                // Überprüfen, ob der Benutzer bereits in der Liste ist
                if (!userIds.includes(uid)) {
                    userIds.push(uid);
                    await setDoc(channelDocRef, { users: userIds }, { merge: true });
                    console.log(`User ${uid} added to channel ${channelId}`);
                }
            } else {
                console.warn(`Channel with ID ${channelId} not found!`);
            }
        }
    } catch (e) {
        console.error('Error creating or updating user: ', e);
    }
}


}
