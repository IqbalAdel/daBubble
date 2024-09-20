import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, onSnapshot, doc, updateDoc, getDoc, DocumentData, CollectionReference, arrayUnion, query, docData, deleteDoc, arrayRemove } from '@angular/fire/firestore';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { User } from './../../models/user.class';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { ChatMessage } from '../chat/chat.component';
import { getDocs, orderBy, where } from 'firebase/firestore';
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

async updateMessage(messageId: string, newText: string): Promise<void> {
  const messageRef = doc(this.firestore, 'channels','messages', messageId);
  const messageSnapshot = await getDoc(messageRef);

  if (messageSnapshot.exists()) {
    await updateDoc(messageRef, { text: newText });
    console.log('Message updated successfully');
  } else {
    console.error('Message does not exist:', messageId);
  }
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

  async updateChannelData(channelID: string, editField: string, newName?: string, newDescription?:string) {
    const channelDoc = await getDoc(this.getChannelDocRef(channelID));
    if (channelDoc.exists()) {
      let name:string = "";
      let description:string = "";
      if ( editField == "name" && newName && newName.length > 0) {
        name = newName;
        await updateDoc(this.getChannelDocRef(channelID), { name });
      }
      if ( editField == "description" && newDescription && newDescription.length > 0) {
        description = newDescription;
        await updateDoc(this.getChannelDocRef(channelID), { description });
      }
      
    } else {
      throw new Error('Channel document does not exist.');
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

  async deleteUserFromChannel(channelId:string, userId: string): Promise<void> {
    const channelDocRef = this.getChannelDocRef(channelId)

    try{
      await updateDoc(channelDocRef,
        {
          users: arrayRemove(userId)
        }
      ); 
      console.log('user removed from channel')
    } catch(error){
      console.error('errro removing user from channel', error)
    }
  }


  async deleteChannelFromUser(uId:string, channelId: string){
    const userDocRef = this.getUserDocRef(uId);

    try{
      await updateDoc(userDocRef, {
        channels: arrayRemove(channelId)
      });
      console.log('channel removed from users')
    } catch(error){
      console.error('error removing channel from users', error)
    }
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

  listenToPrivateMessages(userId: string): Observable<any[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, where('userIds', 'array-contains', userId));
    return collectionData(q, { idField: 'id' });
  }


  createChatId(userId1: string, userId2: string): string | null {
    const isValidUserId = (id: string) => id.startsWith('user_') || id.length === 28; // Beispiel: User-IDs haben ein Präfix 'user_' oder eine bestimmte Länge
    
    // Nur Chat-ID erstellen, wenn beide IDs Benutzer-IDs sind
    if (isValidUserId(userId1) && isValidUserId(userId2)) {
      const sortedIds = [userId1, userId2].sort();  // Alphabetische Sortierung
      console.log('User IDs for chat creation:', userId1, userId2);  // Debugging: IDs ausgeben
      return sortedIds.join('_');  // Kombinierte ID erstellen
    } else {
      console.warn('One or both IDs are not valid user IDs:', userId1, userId2);
      return null;  // Gib null zurück, wenn keine Benutzer-IDs vorliegen
    }
  }


}
