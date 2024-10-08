import { CommonModule, formatDate } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { DialogChannelEditComponent } from '../dialogs/dialogs-channel/dialog-channel-edit/dialog-channel-edit.component';
import { DialogChannelMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddMembersComponent } from '../dialogs/dialogs-channel/dialog-channel-add-members/dialog-channel-add-members.component';
import { ChatComponent, ChatMessage } from '../chat/chat.component';
import { Observable, switchMap } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { filter, map } from 'rxjs/operators';
import { docSnapshots, Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { group } from '@angular/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarMessageComponent } from '../snackbar-message/snackbar-message.component';
import { arrayUnion, getDoc, updateDoc } from 'firebase/firestore';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { GroupAnswerComponent } from '../group-answer/group-answer.component';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, ChatComponent, RouterOutlet, FormsModule, PickerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hier fügst du CUSTOM_ELEMENTS_SCHEMA hinzu
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
})
export class GroupChatComponent implements OnInit, AfterViewInit {
  user: User | null = null;
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef | undefined;
  channels$: Observable<Channel[]> | undefined;
  filteredChannels$: Observable<Channel[]> | undefined;
  groupId!: string;
  messageId!: string;
  groupName!: string;
  groupDescription!: string;
  userChats: ChatMessage[] = [];
  isEditing: { [key: string]: boolean } = {};
  editedMessageText: { [key: string]: string } = {};
  selectedUserId: string = '';
  channelSubscription!: () => void;
  emojiPickerVisibility: { [key: string]: boolean } = {};
  emojiPickerVisible: boolean = false;

  groupAnswerComponent!: GroupAnswerComponent;
  chat: any;

  currentDate!: string;
  currentTime!: string;
  displayDate!: string;
  userName!: string;
  loggedInUserName!: string;
  chatsNummbers: ChatMessage[] = [];
  userImages: string[] = [];
  smileysData: any[] = [];
  dataLoaded = false;
  observerInitialized = false;
  groupChatObserver: any;
  currentThreadStatus: boolean = false;
  isMobile: boolean = false;
  threadOpen: boolean = false;
  supportsTouch: boolean = false;
  screenWidth = window.innerWidth;

  messages: {
    id: string;
    text: string;
    timestamp: string;
    time: any;
    userName: string;
    chats: string;
    image: string;
    userImage: string;
    smileys: { smiley: string, clickedBy: string }[] | null;  // Array von Smileys-Objekten oder null
  }[] = []; groupUsers: User[] = [];
  imgSrc = ['assets/img/smiley/add_reaction.svg', 'assets/img/smiley/comment.svg', 'assets/person_add.svg', 'assets/more_vert.svg'];
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];
  groupName$: Observable<string | null> = this.userService.selectedChannelName$;
  imgKeyboard: string = 'assets/img/keyboard_arrow_down.svg';
  
  isImageModalOpen: boolean = false;
  selectedImageForModal: string | null = null;
 // Funktion zum Öffnen des Modals
 openImageModal(imageUrl: string): void {
  this.isImageModalOpen = true;
  this.selectedImageForModal = imageUrl;
}

// Funktion zum Schließen des Modals
closeImageModal(): void {
  this.isImageModalOpen = false;
  this.selectedImageForModal = null;
}

  // openSnackBar() {
  //   console.log('snackbar opened')
  //   if(this.userService.threadOpenStatus$){

  //   }
  //   let snackBarRef = this.snackBar.openFromComponent(SnackbarMessageComponent, {
  //     // duration: 1000,
  //     panelClass: 'my-custom-snackbar',
  //   });

  //   snackBarRef.afterDismissed().subscribe(() => {
  //     console.log('The snackbar was dismissed');
  //   });
  //   snackBarRef.onAction().subscribe(() => {
  //     this.scrollToBottom();
  //     ;
  //   });
  // }



  constructor(
    private route: ActivatedRoute,
    public userService: UserService, // Richtiger Service Name
    private dialog: MatDialog, // Verwende nur eine Instanz von MatDialog
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar,
    // public dialogRef: MatDialogRef<DialogChannelMembersComponent>

  ) {
    this.groupName$ = this.userService.selectedChannelName$;
    this.screenWidth = window.innerWidth;
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
    // if(this.supportsTouch || window.innerWidth < 992){
    //   this.isMobile = true;
    // }
    if(this.currentThreadStatus && this.screenWidth < 993){
      this.threadOpen = true;
      // console.log(this.currentThreadStatus && this.screenWidth < 993, this.screenWidth)
      // console.log(this.threadOpen, this.screenWidth)
    } else if(!this.currentThreadStatus && this.screenWidth >993){
      this.checkThreadStatus();
    } else{
      this.threadOpen = false;
      // this.isMobile = false;
      // console.log(this.currentThreadStatus && this.screenWidth < 993, this.screenWidth)
      // console.log(this.threadOpen, this.screenWidth)
      // console.log(this.isMobile)
    }
    
  }

  ngAfterViewInit(): void {
    if(!this.isMobile){
      this.checkThreadStatus();
    }    

  }

  checkThreadStatus(){
    this.userService.threadOpenStatus$.subscribe((status: boolean) => {
      this.currentThreadStatus = status;
      switch (status) {
        case true:
        this.disconnectGroupChat()
          break;
      
        case false:
          this.observeGroupChat()
          break;
      }
      
    });
  }

  observeGroupChat(): void {
    // Select only the group-chat section
    const groupChatContainer = this.scrollContainer!.nativeElement;

    if (!groupChatContainer) return;

    const config = { childList: true, subtree: false }; // Only observe direct children in group chat
    const observer = new MutationObserver(() => {
      this.scrollToBottom();  // Scroll to bottom only for group chat

    });

    observer.observe(groupChatContainer, config);

    // Store observer reference to disconnect later if necessary
    this.groupChatObserver = observer;
    // console.log(this.groupChatObserver, 'observer on')
  }

  disconnectGroupChat() {
    if (this.groupChatObserver) {
      console.log(this.groupChatObserver, 'observer off')
      this.groupChatObserver.disconnect(); // Stop observing group-chat
    }

  }


  ngOnInit(): void {
    this.userImages = [];
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
      // this.loadGroupName();
      this.subscribeToGroupName();
      this.loadMessages();
      this.loadGroupUsers();
      this.loggedInUser();
      this.getChannelsForusers();
      this.loadUserChats();
      this.loadChannelData(this.groupId);
      this.loadSmileysForMessage(this.messageId);
    });
    this.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if(window.innerWidth < 992){
      this.isMobile = true;
    }

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      console.log('thread closed?')
      if(this.checkIfBackToMainGroupChat()){
        this.threadOpen = false;
      }
      else{
        console.log('something went wrong')
      }
      // this.checkForGroupAnswerComponent(this.route);
    })
  }

  checkIfBackToMainGroupChat() {
    const currentUrl = this.router.url;

    // Check if URL contains a thread segment (adjust the regex if needed)
    const isThreadOpen = currentUrl.includes('/group-answer/'); // Example thread segment

    if (!isThreadOpen) {
      return true
  } else{
    return false
  }
}

  isFirstMessageOfDay(currentMessage: any, index: number): boolean {
    if (index === 0) {
      return true; // Always show the date for the first message
    }

    const previousMessage = this.messages[index - 1];

    // Convert the timestamps to a valid Date object or ISO string
    const currentDate = this.parseGermanDate(currentMessage.timestamp);
    const previousDate = this.parseGermanDate(previousMessage.timestamp);

    // Ensure both dates are valid before comparing
    if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
      console.error('Invalid date format:', currentMessage.timestamp, previousMessage.timestamp);
      return false;
    }

    // Compare the dates without time
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  // Parse a German date string (e.g., 'Mittwoch, 18.09.2024')
  parseGermanDate(dateString: string): Date {
    // Extract the part after the day of the week
    const datePart = dateString.split(', ')[1]; // Get the '18.09.2024' part
    const [day, month, year] = datePart.split('.');

    // Return a Date object in the format 'YYYY-MM-DD'
    return new Date(`${year}-${month}-${day}`);
  }

  loadMessages(): void {
    if (this.groupId) {
      this.firebaseService.getChannelsMessages(this.groupId).subscribe(
        (channelData: any[]) => {
          this.messages = this.formatMessages(channelData); // Formatierte Nachrichten setzen
          console.log("Geladene Nachrichten mit Smileys:", this.messages);
        },
        (error: any) => {
          console.error('Fehler beim Abrufen der Nachrichten:', error);
        }
      );
    }
  }

  formatMessageTime(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',    // Stunde
      minute: '2-digit',  // Minute
      // Sekunden weglassen
    });
  }

  formatMessages(messages: any[]): any[] {
    let previousDate: string = "";

    return messages.map((message, index) => {
      const currentDate = this.formatTimestamp(message.timestamp); // Format the date
      const isFirstMessageOfDay = currentDate !== previousDate; // Check if it's the first message of the day

      previousDate = currentDate; // Update previousDate for next iteration

      return {
        ...message,
        timestamp: isFirstMessageOfDay ? currentDate : null, // Show date only for the first message of the day
        time: this.formatMessageTime(message.timestamp)      // Always show the time
      };
    });
  }

  formatTimestamp(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
    const today = new Date();

    // Create a Date object for yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // If the message is from today, display 'Heute'
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    }
    // If the message is from yesterday, display 'Gestern'
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    }

    else {
      return date.toLocaleDateString('de-DE', { // Formatierung für deutsches Datum
        weekday: 'long',  // Wochentag
        day: '2-digit',   // Tag
        month: '2-digit', // Monat
        year: 'numeric'   // Jahr
      });
    }
  }

  loadUserChats(): void {
    if (this.selectedUserId) {
      this.firebaseService.getChatsForUser(this.selectedUserId).subscribe(
        (chats: ChatMessage[]) => {
          this.userChats = chats;
          // Optional: Verarbeite die Daten weiter, falls notwendig
        },
        (error) => {
          console.error('Fehler beim Abrufen der Chats:', error);
        }
      );
    }
  }

  async loggedInUser() {
    try {
      const uid = await this.firebaseService.getCurrentUserUid();
      if (uid) {
        await this.userService.loadUserById(uid);
        this.user = this.userService.getUser();
        if (this.user) {
          this.loggedInUserName = this.user.name; // Setze den Namen des eingeloggten Benutzers
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

  // async loadGroupName() {
  //   try {
  //     if (this.groupId) {
  //       const channelData = await this.firebaseService.getChannelById(this.groupId);
  //       if (channelData) {
  //         this.groupName = channelData.name || 'Kein Name gefunden';  // Angenommene Struktur der Daten
  //       } else {
  //         this.groupName = 'Kein Name gefunden';
  //       }
  //     } else {
  //       this.groupName = 'Keine Gruppen-ID vorhanden';
  //     }
  //   } catch (error) {
  //     this.groupName = 'Fehler beim Laden';
  //   }
  // }

  subscribeToGroupName(): void {
    if (this.groupId) {

      const channelDocRef = doc(this.firestore, 'channels', this.groupId)

      this.channelSubscription = onSnapshot(channelDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const channelData = docSnapshot.data();
            this.groupName = channelData?.['name'] || 'kein Name gefunde';
            this.groupDescription = channelData?.['description'] || 'kein Name gefunde';
          } else {
            this.groupName = 'Kein name gefunden';
            this.groupDescription = 'Keine Beschreibung gefunden';
          }
        }
      );
    }
  }

  async loadGroupUsers() {
    try {
      const channelData = await this.firebaseService.getChannelById(this.groupId);
      if (channelData && channelData.users) {
        const userIds = channelData.users;  // Angenommene Struktur: users ist ein Array von User-IDs
        const userPromises = userIds.map((userId: string) => this.firebaseService.getUserById(userId));
        const users = await Promise.all(userPromises);

        // Filtere Benutzer, die null sind, heraus
        this.groupUsers = users.filter((user): user is User => user !== null);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Channel-Benutzer:', error);
    }
  }

  navigateToAnswers(answerId: string) {
    this.router.navigate([`/main/group-chat/${this.groupId}/group-answer/${answerId}`]);
    this.userService.showGroupAnswer = true;
    this.userService.setThreadStatus(true);
    this.closeEmojiSelection();
  }


  changeImageSmiley(isHover: boolean) {
    this.imgSrc[0] = isHover ? 'assets/img/smiley/add_reaction-blue.svg' : 'assets/img/smiley/add_reaction.svg';
  }

  changeImageComment(isHover: boolean) {
    this.imgSrc[1] = isHover ? 'assets/img/smiley/comment-blue.svg' : 'assets/img/smiley/comment.svg';
  }

  changeImageAddContat(isHover: boolean) {
    this.imgSrc[2] = isHover ? 'assets/person_add_blue.svg' : 'assets/person_add.svg';
  }
  changeImageMoreVert(isHover: boolean) {
    this.imgSrc[3] = isHover ? 'assets/more_vert_hover.svg' : 'assets/more_vert.svg';
  }

  openChannelInfo(){
    this.openEditChannel();
    
  }

  openEditChannel() {
    this.dialog.open(DialogChannelEditComponent, {
      panelClass: 'border-30',
      data: {
        channelID: this.groupId,
        channelName: this.groupName,
        channelDescription: this.groupDescription,
      },
      autoFocus: false,
    });
  }

  openDialogMemberList() {
    this.dialog.open(DialogChannelMembersComponent, {
      panelClass: 'border-30-right',
      // width: '300px',
      // position: { top: '200px', right: '100px' },
      data: {
        channelID: this.groupId,
      }

    });
   
  }

  openDialogAddMember() {
    this.openDialogMemberList();
    // if(this.screenWidth <= 992){
    // } else{
    //   this.showAddMembersMenu()
    // }
  }

  showAddMembersMenu(){
    this.dialog.open(DialogChannelAddMembersComponent, {
      panelClass: 'border-30-right',
      // width: '400px',
      // height: '200px',
      position: { top: '200px', right: '50px' },
      data: {
        channelID: this.groupId,
      },
      autoFocus: false,
    });
  }


  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {
      }
    } else{
      // console.log('mist')
      // this.observeGroupChat()
    }
  }

  getChannelsForusers() {
    this.filteredChannels$ = this.route.paramMap.pipe(
      switchMap(params => {
        const channelId = params.get('id');
        return this.firebaseService.getChannels().pipe(
          map(channels => channels.filter(channel => channel.id === channelId))
        );
      })
    );
  }

  async loadChannelData(channelId: string) {
    const channelData = await this.firebaseService.getChannelById(channelId);
    if (channelData) {
      const userIds = channelData.users;
      if (userIds) {
        await this.loadUserImages(userIds);
        this.dataLoaded = true;
      }
    }
    // this.scrollToBottom();
  }

  async loadUserImages(userIds: string[]) {
    const currentChannel = this.groupId;
    this.userImages = [];
    // let i = 0; 
    for (const userId of userIds) {
      const userData = await this.firebaseService.getUserById(userId);
      if (userData && currentChannel == this.groupId) {
        this.userImages.push(userData.img)
        // i++;
      }
    }
    // console.log(this.userImages)
  }

  editText(messageId: string) {
    this.isEditing[messageId] = true;  // Aktiviert den Bearbeitungsmodus
    const currentText = this.messages.find(msg => msg.id === messageId)?.text;  // Findet den aktuellen Text der Nachricht
    if (currentText) {
      this.editedMessageText[messageId] = currentText;  // Speichert den aktuellen Text
    }

  }

  saveText(messageId: string) {
    this.isEditing[messageId] = false;  // Deaktiviert den Bearbeitungsmodus
    const newText = this.messages.find(msg => msg.id === messageId)?.text;  // Hole den neuen Text aus message.text
    if (newText) {
      this.firebaseService.updateMessage(this.groupId, messageId, newText)
        .then(() => {
          console.log('Nachricht erfolgreich gespeichert:', newText);
        })
        .catch(error => {
          console.error('Fehler beim Speichern der Nachricht:', error);
        });
    } else {
      console.log('Keine Änderungen im Text, nichts zu speichern.');
    }
  }

  getLastChatTime(message: any): string | null {
    if (message.chats && message.chats.length > 0) {
      // Hole die Zeit des letzten Chat-Eintrags
      const lastChat = message.chats[message.chats.length - 1];

      let timeString = lastChat.time; // Nimm den Zeitstring

      // Überprüfe, ob timeString im "HH:mm:ss" Format ist
      const timePattern = /^\d{2}:\d{2}:\d{2}$/;
      if (timePattern.test(timeString)) {
        // Teile den String in Stunden, Minuten und Sekunden
        const [hours, minutes] = timeString.split(':');

        // Gib die Zeit nur mit Stunden und Minuten zurück
        return `${hours}:${minutes}`;
      } else {
        console.error('Invalid chat time format:', timeString);
        return null; // Ungültiges Zeitformat
      }
    }

    return null; // Keine Chats vorhanden
  }
  
  async saveSmileyToMessage(smiley: string, messageId: string) {
    this.disconnectGroupChat()
    if (!this.loggedInUserName) {
        console.error('Kein Benutzer eingeloggt.');
        return;
    }

    const messageDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${messageId}`);
    const messageDocSnapshot = await getDoc(messageDocRef);

    if (!messageDocSnapshot.exists()) {
        console.error('Nachricht nicht gefunden:', messageId);
        return;
    }

    const smileysArray = messageDocSnapshot.data()?.['smileys'] || [];
    const existingSmileyIndex = smileysArray.findIndex((s: { smiley: string }) => s.smiley === smiley);
    const clickedByArray = existingSmileyIndex > -1 ? smileysArray[existingSmileyIndex].clickedBy : null;

    if (clickedByArray) {
        const userIndex = clickedByArray.indexOf(this.loggedInUserName);
        userIndex > -1 ? clickedByArray.splice(userIndex, 1) : clickedByArray.push(this.loggedInUserName);
        if (clickedByArray.length === 0) smileysArray.splice(existingSmileyIndex, 1);
    } else {
        smileysArray.push({ smiley, clickedBy: [this.loggedInUserName], clickedAt: new Date() });
    }

    try {
        await updateDoc(messageDocRef, { smileys: smileysArray });
        console.log('Smiley erfolgreich aktualisiert:', smileysArray);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Smileys:', error);
    }
}

  // laden der Smileys
  async loadSmileysForMessage(messageId: string) {
    const messageDocRef = doc(this.firestore, `channels/${this.groupId}/messages/${messageId}`);
    console.log('Lade Smiley für Nachricht:', messageId, 'in Gruppe:', this.groupId);
    try {
      const messageDocSnapshot = await getDoc(messageDocRef);

      if (messageDocSnapshot.exists()) {
        const messageData = messageDocSnapshot.data();
        this.smileysData = messageData?.['smileys'] || [];
        console.log("Smileys geladen:", this.smileysData);
      } else {
      }
    } catch (error) {
      console.error('Fehler beim Laden der Smileys:', error);
    }
  }

  groupSmileys(smileys: any[]): any[] {
    const groupedSmileys: any[] = [];

    smileys.forEach((smiley) => {
        const existingSmiley = groupedSmileys.find(
            (group) => group.smiley === smiley.smiley
        );

        if (existingSmiley) {
            // Wenn das Smiley schon existiert, füge die Benutzer zur bestehenden Gruppe hinzu
            // Prüfe, ob `smiley.clickedBy` wirklich ein Array ist
            if (Array.isArray(smiley.clickedBy)) {
                existingSmiley.clickedBy.push(...smiley.clickedBy);
            } else {
                // Füge den Benutzer als Ganzes hinzu, falls es ein String ist
                existingSmiley.clickedBy.push(smiley.clickedBy);
            }
            existingSmiley.count = existingSmiley.clickedBy.length; // Aktualisiere die Anzahl der Reaktionen
        } else {
            // Neues Smiley hinzufügen
            groupedSmileys.push({
                smiley: smiley.smiley,
                clickedBy: Array.isArray(smiley.clickedBy) ? [...smiley.clickedBy] : [smiley.clickedBy],
                count: Array.isArray(smiley.clickedBy) ? smiley.clickedBy.length : 1, // Setze die Anzahl der Reaktionen
            });
        }
    });

    return groupedSmileys;
}



  toggleEmojiPicker(messageId: string): void {
    // Toggelt die Sichtbarkeit basierend auf der aktuellen Sichtbarkeit
    this.emojiPickerVisibility[messageId] = !this.emojiPickerVisibility[messageId];
  }

  // Methode, die prüft, ob der Emoji-Picker für eine Nachricht sichtbar sein soll
  isEmojiPickerVisible(messageId: string): boolean {
    return !!this.emojiPickerVisibility[messageId]; // Gibt true zurück, wenn sichtbar, sonst false
  }

  selectSmiley() {
    this.emojiPickerVisible = !this.emojiPickerVisible; // Umschalten der Sichtbarkeit
  }
  
  addSmileyToGroup(smileyGroup: any, message: any) {
    // Überprüfen, ob der Benutzer bereits auf den Smiley reagiert hat
    const userIndex = smileyGroup.clickedBy.indexOf(this.loggedInUserName);
  
    if (userIndex === -1) {
      // Wenn der Benutzer noch nicht reagiert hat, füge den Benutzernamen hinzu
      smileyGroup.clickedBy.push(this.loggedInUserName);
      smileyGroup.count++; // Erhöhe den Zähler für den Smiley
    } else {
      // Wenn der Benutzer bereits reagiert hat, entferne den Benutzernamen aus der Liste
      smileyGroup.clickedBy.splice(userIndex, 1);
      smileyGroup.count--; // Verringere den Zähler für den Smiley
    }
  
    // Optional: Hier könntest du die Smiley-Daten auf der Server-Seite aktualisieren, falls nötig
    // this.messageService.updateSmiley(message.id, smileyGroup);
  }

  addEmoji(event: any, messageId: string) {
    const emoji = event.emoji.native;
    console.log("Selected Emoji:", emoji, "for message:", messageId);

    this.saveSmileyToMessage(emoji, messageId);
    this.closeEmojiSelection();
    // this.observeGroupChat();
  }

  closeEmojiSelection() {
    this.emojiPickerVisible = false;
  }

  
  isUserEqualToChatUser(chatUserName: string): boolean {
    return this.loggedInUserName === chatUserName;
}
  onActivate(componentRef: any) {
    if (componentRef instanceof GroupAnswerComponent) {
      this.groupAnswerComponent = componentRef;
      this.chat = componentRef;
      console.log('group has answered the call')
    }
  }

  getFormattedNames(clickedBy: string[]): string {
    let clickedByCopy = [...clickedBy]; // Array kopieren
    const loggedInUserIndex = clickedByCopy.indexOf(this.loggedInUserName);

    if (loggedInUserIndex > -1) {
        clickedByCopy.splice(loggedInUserIndex, 1);
        clickedByCopy.push('Du');
    }

    if (clickedByCopy.length === 1) {
        return clickedByCopy[0] === 'Du' ? 'Du hast reagiert' : `${clickedByCopy[0]} hat reagiert`;
    }
    if (clickedByCopy.length === 2) {
        return `${clickedByCopy.join(' und ')} haben reagiert`;
    }

    const lastUser = clickedByCopy.pop();
    return `${clickedByCopy.join(', ')} und ${lastUser} haben reagiert`;
}




}


