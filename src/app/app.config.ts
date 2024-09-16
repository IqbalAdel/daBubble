import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth'; // Importiere Auth Module
import { provideStorage, getStorage } from '@angular/fire/storage';
import { routes } from './app.routes';

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
      appId: "1:255571591771:web:030b649a0f5865b2bbf57e"
    })),
    provideAuth(() => getAuth()), // Stelle Auth bereit
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()) 
  ]
};
