import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, setDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = inject(Firestore);

  constructor() { }


  getUsersRef(){
    return collection(this.firestore, 'users');
  }
  getChannels(): Observable<any[]> {
    const channelsRef = collection(this.firestore, 'channels');
    return collectionData(channelsRef);
  }
  getChatsRef(){
    return collection(this.firestore, 'chats');
  }
  getChannelsRef(){
    return collection(this.firestore, 'channels');
  }

  getSingleDocRef(collID: string, docID: string){
    return doc(collection(this.firestore, collID), docID)
  }

  getUsers(){
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef);
  }

  async addChannel(channel: Channel) {
    try {
      const channelsRef = collection(this.firestore, 'channels');

      // Add a new document and get the reference
      const docRef = await addDoc(channelsRef, {
        ...channel, // Add initial data without the id
      });
      console.log('Channel added successfully');

      // Update the document with the generated ID
      await updateDoc(docRef, {
        id: docRef.id // Add the generated ID to the document
      });

      console.log('Channel added successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding channel:', error);
    }
    
  }
}
