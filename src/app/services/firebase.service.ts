import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, setDoc, docData, DocumentData, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { User } from './../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = inject(Firestore);

  constructor() { }


  getUsersRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, 'users') as CollectionReference<DocumentData>;
  }

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>; // Achte darauf, dass der Typ korrekt ist
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

  getChannelsMessages(channelId: string): Promise<any> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);  // Verwende die übergebene channelId
    return getDoc(channelDocRef).then(docSnapshot => {
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        return null;
      }
    }).catch(error => {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
      return null;
    });
  }


  // Iqbals Funktionen -------------------
  
  getUsersData(){
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
      // Update the document with the generated ID
      await updateDoc(docRef, {
        id: docRef.id // Add the generated ID to the document
      });

    } catch (error) {
      console.error('Error adding channel:', error);
    }
    
  }

  getChannelById(channelId: string): Promise<Channel | null> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return getDoc(channelDocRef).then(docSnapshot => {
      if (docSnapshot.exists()) {
        const channelData = docSnapshot.data() as Channel;
        return new Channel(
          channelData.name || '',
          channelData.description || '',
          channelId
        );
      } else {
        return null;
      }
    }).catch(error => {
      return null;
    });
  }


  getUserById(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, 'users', userId);
    return getDoc(userDocRef).then(docSnapshot => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        return new User(
          userData['name'] || '',
          userData['email'] || '',
          userId,
          userData['img'] || '',
          userData['password'] || ''
        );
      } else {
        return null;
      }
    }).catch(error => {
      return null;
    });
  }
}
