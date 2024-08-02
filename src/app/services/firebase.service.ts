import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = inject(Firestore);

  constructor() { }


  getUsersRef(){
    return collection(this.firestore, 'users');
  }
  getChannelsRef(){
    return collection(this.firestore, 'channels');
  }
  getChatsRef(){
    return collection(this.firestore, 'chats');
  }

  getSingleDocRef(collID: string, docID: string){
    return doc(collection(this.firestore, collID), docID)
  }



}
