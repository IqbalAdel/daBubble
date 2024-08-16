import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  async signUp(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('User signed up:', userCredential.user);
      return userCredential.user; // Rückgabe des User-Objekts bei Erfolg
    } catch (error) {
      console.error('Error signing up:', error);
      return null; // Rückgabe von null im Fehlerfall
    }
  }

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('User signed in:', userCredential.user);
      return userCredential.user; // Rückgabe des User-Objekts bei Erfolg
    } catch (error) {
      console.error('Error signing in:', error);
      return null; // Rückgabe von null im Fehlerfall
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
