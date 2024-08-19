import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, setDoc, docData, DocumentData, CollectionReference, arrayUnion, writeBatch, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { User } from './../../models/user.class';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth = inject(Auth);

  firestore: Firestore = inject(Firestore);

  constructor() { }
  
  async getCurrentUserUid(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null);
        }
      }, (error) => {
        reject(error);
      });
    });
  }


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

  getFirestore(): Firestore {
    return this.firestore;
}
  
  getUsersData(){
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef);
  }

  getUserDocRef(docID: string){
    return doc(collection(this.firestore, 'users'), docID)
  }
  getChannelDocRef(docID: string){
    return doc(collection(this.firestore, 'channels'), docID)
  }

  async updateUserChannels(userID: string, channelId: string) {
    const userDoc = await getDoc(this.getUserDocRef(userID));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const channels = userData?.['channels'] || [];
      if (!channels.includes(channelId)) {
        channels.push(channelId);
      }
      await updateDoc(this.getUserDocRef(userID), { channels });
    } else {
      throw new Error('User document does not exist.');
    }
  }

  async updateChannelUserList(userID: string, channelId: string) {
    const channelDoc = await getDoc(this.getChannelDocRef(channelId));
    if (channelDoc.exists()) {
      const channelData = channelDoc.data();
      const users = channelData?.['users'] || [];
      if (!users.includes(userID)) {
        users.push(userID);
      }
      await updateDoc(this.getChannelDocRef(channelId), { users });
    } else {
      throw new Error('User document does not exist.');
    }
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
      return docRef;

    } catch (error) {
      console.error('Error adding channel:', error);
      return null;
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
