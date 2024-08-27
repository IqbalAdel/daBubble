import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, DocumentData, CollectionReference, arrayUnion, query, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { User } from './../../models/user.class';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { ChatMessage } from '../chat/chat.component';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth = inject(Auth);
  private storage = getStorage();
  firestore: Firestore = inject(Firestore);

  constructor() { }
  
  async  getImageDownloadURL(imagePath: string): Promise<string> {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);
    try {
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Fehler beim Abrufen der Bild-URL:', error);
      throw error;
    }
  }


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
  getChannels(): Observable<Channel[]> {
    const channelsRef = collection(this.firestore, 'channels');
    return collectionData(channelsRef, { idField: 'id' }) as Observable<Channel[]>;
  }
  getChatsRef() {
    return collection(this.firestore, 'chats');
  }
  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleDocRef(collID: string, docID: string) {
    return doc(collection(this.firestore, collID), docID)
  }

  getChannelsMessages(channelId: string): Observable<ChatMessage[]> {
    const messagesCollection = collection(this.firestore, 'channels', channelId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp'));
    return collectionData(q, { idField: 'id' }) as Observable<ChatMessage[]>; // Verwende ChatMessage[]
  }

  getChatsForUser(userId: string): Observable<ChatMessage[]> {
    const userChatsCollection = collection(this.firestore, 'users', userId, 'chats');
    const q = query(userChatsCollection, orderBy('timestamp'));
    return collectionData(q, { idField: 'id' }) as Observable<ChatMessage[]>;
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  getUsersData() {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef);
  }

  getUserDocRef(docID: string) {
    return doc(collection(this.firestore, 'users'), docID)
  }
  
  getChannelDocRef(docID: string) {
    return doc(collection(this.firestore, 'channels'), docID)
  }

  getChannelData(docID: string): Observable<any> {
    const channelDocRef = this.getChannelDocRef(docID);
    return docData(channelDocRef);
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
  async updateUserData(userID: string, newName?: string, newMail?:string) {
    const userDoc = await getDoc(this.getUserDocRef(userID));
    if (userDoc.exists()) {
      let email:string = "";
      let name:string = "";
      if (newName && newName.length > 0) {
        name = newName;
        await updateDoc(this.getUserDocRef(userID), { name });
      }
      if (newMail && newMail.length > 0) {
        email = newMail;
        await updateDoc(this.getUserDocRef(userID), { email });
      }
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
      const docRef = await addDoc(channelsRef, {
        ...channel,
      });
      // console.log('Channel added successfully');
      await updateDoc(docRef, {
        id: docRef.id
      });
      return docRef;
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
          channelData.creator || '',
          channelData.messages || [],
          channelData.users || [],
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

  async addMessageToFirestore(channelId: string, message: { text: string; timestamp: string; time: string }): Promise<void> {
    try {
      const channelDocRef = doc(this.firestore, 'channels', channelId);
      const channelDoc = await getDoc(channelDocRef);
      if (channelDoc.exists()) {
        const currentMessages = channelDoc.data()['messages'] || [];
        const updatedMessages = [...currentMessages, message];  // Nachricht als Objekt hinzufügen
        await updateDoc(channelDocRef, { messages: updatedMessages });
        // console.log('Message successfully added to channel:', message);
      } else {
        console.error('Channel does not exist:', channelId);
      }
    } catch (error) {
      console.error('Error adding message to Firestore:', error);
    }
  }


  addMessageToUserChats(userId: string, message: any): Promise<void> {
    // Referenz zur Unter-Sammlung "messages" unter der Benutzer-ID
    const userMessagesRef = collection(this.firestore, `users/${userId}/messages`);
    
    // Neue Nachricht in die Unter-Sammlung hinzufügen
    return addDoc(userMessagesRef, message)
      .then(() => {
        console.log('Message successfully added to user chats!');
      })
      .catch((error) => {
        console.error('Error adding message to user chats:', error);
        throw error; // Falls ein Fehler auftritt, wirft es den Fehler zurück
      });
  }

  async getPrivateMessages(userId: string): Promise<any[]> {
    const messagesRef = collection(this.firestore, `users/${userId}/messages`);
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
  
    const querySnapshot = await getDocs(messagesQuery);
    return querySnapshot.docs.map(doc => doc.data());
  }

  listenToPrivateMessages(userId: string, loggedInUserId: string): Observable<any[]> {
    const messagesRef = collection(this.firestore, `users/${userId}/messages`);
    
    const messagesQuery = query(
      messagesRef,
      where('senderId', 'in', [loggedInUserId, userId]),
      where('receiverId', 'in', [loggedInUserId, userId]),
      orderBy('timestamp', 'asc')
    );
  
    return new Observable(observer => {
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => doc.data());
        observer.next(messages);
      });
      
      return () => unsubscribe();
    });
  }

 

 

}
