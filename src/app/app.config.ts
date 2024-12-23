import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth'; 
import { provideStorage, getStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
import { provideDatabase, getDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp({ 
      apiKey: "AIzaSyAIi9jGtrLP4f4qdry-askwdqBCeYOeo9M",
      authDomain: "da-bubble-e728c.firebaseapp.com",
      projectId: "da-bubble-e728c",
      storageBucket: "da-bubble-e728c.appspot.com",
      messagingSenderId: "255571591771",
      appId: "1:255571591771:web:030b649a0f5865b2bbf57e",
      databaseURL: "https://da-bubble-e728c-default-rtdb.europe-west1.firebasedatabase.app",
    })),
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideDatabase(() => getDatabase())
  ]
};
