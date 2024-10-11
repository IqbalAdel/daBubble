import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { ActionCodeSettings, signInWithPopup, GoogleAuthProvider, signOut } from '@firebase/auth';
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail, confirmPasswordReset as firebaseConfirmPasswordReset, User } from 'firebase/auth';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() { }

 async checkEmailExists(email: string): Promise<boolean> {
  try {

    const usersCollectionRef = collection(this.firestore, 'users');
    const q = query(usersCollectionRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; 
  } catch (error) {
    console.error('Fehler beim Überprüfen der E-Mail:', error);
    throw error; 
  }
}


sendPasswordReset(email: string): Promise < void> {
  return sendPasswordResetEmail(this.auth, email)
    .then(() => {
      console.log('Password reset email sent.');
    })
    .catch((error) => {
      console.error('Error sending password reset email:', error);
      throw error;
    });
}


newPassword(oobCode: string, newPassword: string): Promise < void> {
  return firebaseConfirmPasswordReset(this.auth, oobCode, newPassword)
    .then(() => {
      console.log('Password has been reset.');
    })
    .catch((error) => {
      console.error('Error resetting password:', error);
      throw error;
    });
}

async googleSignIn(): Promise < void> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;

    if(user) {

      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        img: user.photoURL,
        channels: [],
        chats: []
      };

      await setDoc(userRef, userData, { merge: true }); 
      console.log('User successfully signed in and stored in Firestore:', user);
      
    }
  } catch(error) {
    console.error('Google Sign-In failed:', error);
    throw error; 
  }
}

googleSignOut() {
  return signOut(this.auth)
    .then(() => {
      console.log('User signed out');
    })
    .catch((error) => {
      console.error('Error during sign out:', error);
      throw error;
    });
}

resetPassword(email: string): Promise < void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: 'http://localhost:4200/',
  };

  return firebaseSendPasswordResetEmail(this.auth, email, actionCodeSettings)
    .then(() => {
      console.log('Password reset email sent.');
    })
    .catch((error) => {
      console.error('Error sending password reset email:', error);
      throw error;
    });
}
  async signUp(email: string, password: string, userData: any): Promise < UserCredential | null > {
  try {

    const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    console.log('User signed up:', userCredential.user);


    const uid = userCredential.user.uid;


    const cleanedUserData = { ...userData, uid: uid };
    const docRef = doc(this.firestore, 'users', uid);
    await setDoc(docRef, cleanedUserData);

      return userCredential;
  } catch(error) {
    console.error('Error signing up:', error);
    return null; 
  }
}

  async signIn(email: string, password: string): Promise < UserCredential | null > {
  try {

    const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    console.log('User signed in:', userCredential.user);

    return userCredential; 
  } catch(error) {
    console.error('Error signing in:', error);
    return null; 
  }
}

  async signOut(): Promise < void> {
  try {
    await signOut(this.auth);
    console.log('User signed out');
  } catch(error) {
    console.error('Error signing out:', error);
  }
}
}

