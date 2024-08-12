import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { CommonModule } from '@angular/common';
import { DocumentData } from '@angular/fire/firestore';
import { doc, Firestore, getDoc } from '@firebase/firestore';

@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solo-chat.component.html',
  styleUrl: './solo-chat.component.scss'
})
export class SoloChatComponent {
  userId: string | null = null;
  userData: DocumentData | undefined;

  constructor(private route: ActivatedRoute) { }

  
  
  

}
