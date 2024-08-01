import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-e728c","appId":"1:255571591771:web:030b649a0f5865b2bbf57e","storageBucket":"da-bubble-e728c.appspot.com","apiKey":"AIzaSyAIi9jGtrLP4f4qdry-askwdqBCeYOeo9M","authDomain":"da-bubble-e728c.firebaseapp.com","messagingSenderId":"255571591771"})), provideFirestore(() => getFirestore()), provideAnimationsAsync()]
};
