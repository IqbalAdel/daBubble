import { Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { User } from '../../models/user.class';
import { ChatComponent } from '../chat/chat.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-solo-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, HttpClientModule],
  templateUrl: './solo-chat.component.html',
  styleUrls: ['./solo-chat.component.scss']
})
export class SoloChatComponent implements OnInit {
  user$: Observable<User | undefined> = of(undefined);

  constructor(
    private firestore: Firestore,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.user$ = this.userService.selectedUserId$.pipe(
      switchMap(userId => {
        if (userId) {
          return this.loadUserData(userId);
        } else {
          // Wenn keine ID vorhanden ist, lade den zuletzt ausgewählten Benutzer oder den ersten Benutzer
          const lastSelectedUserId = this.userService.getLastSelectedUserId();
          if (lastSelectedUserId) {
            return this.loadUserData(lastSelectedUserId);
          } else {
            return this.loadDefaultUser();
          }
        }
      }),
      catchError(error => {
        console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
  }

  loadUserData(userId: string | null): Observable<User | undefined> {
    if (!userId) {
      return of(undefined);
    }

    const userDoc = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userDoc)).pipe(
      map(userSnapshot => {
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          return new User(
            userData['name'] || '',
            userData['email'] || '',
            userId,
            userData['img'] || '',
            userData['password'] || ''
          );
        } else {
          console.log('No such user!');
          return undefined;
        }
      }),
      catchError(error => {
        console.error('Error loading user data:', error);
        return of(undefined);
      })
    );
  }

  loadDefaultUser(): Observable<User | undefined> {
    // Hier wird der erste Benutzer geladen
    const usersCollection = collection(this.firestore, 'users');
    return from(getDocs(usersCollection)).pipe(
      map(querySnapshot => {
        const firstUserDoc = querySnapshot.docs[0];
        if (firstUserDoc) {
          const userData = firstUserDoc.data();
          return new User(
            userData['name'] || '',
            userData['email'] || '',
            firstUserDoc.id,
            userData['img'] || '',
            userData['password'] || ''
          );
        } else {
          console.log('No users found!');
          return undefined;
        }
      }),
      catchError(error => {
        console.error('Error loading default user data:', error);
        return of(undefined);
      })
    );
  }
}
