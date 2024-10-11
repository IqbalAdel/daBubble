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
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
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
    smileys: { smiley: string, clickedBy: string }[] | null;  
  } [] = []; groupUsers: User[] = [];

  imgSrc = ['assets/img/smiley/add_reaction.svg', 'assets/img/smiley/comment.svg', 'assets/person_add.svg', 'assets/more_vert.svg'];
  imgTextarea = ['assets/img/add.png', 'assets/img/smiley/sentiment_satisfied.png', 'assets/img/smiley/alternate_email.png', 'assets/img/smiley/send.png'];
  groupName$: Observable<string | null> = this.userService.selectedChannelName$;
  imgKeyboard: string = 'assets/img/keyboard_arrow_down.svg';
  
  isImageModalOpen: boolean = false;
  selectedImageForModal: string | null = null;

 openImageModal(imageUrl: string): void {
  this.isImageModalOpen = true;
  this.selectedImageForModal = imageUrl;
}


closeImageModal(): void {
  this.isImageModalOpen = false;
  this.selectedImageForModal = null;
}

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private dialog: MatDialog, 
    private firebaseService: FirebaseService,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar,

  ) {
    this.groupName$ = this.userService.selectedChannelName$;
    this.screenWidth = window.innerWidth;
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;

    if(this.currentThreadStatus && this.screenWidth < 993){
      this.threadOpen = true;

    } else if(!this.currentThreadStatus && this.screenWidth >993){
      this.checkThreadStatus();
    } else{
      this.threadOpen = false;

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

    const groupChatContainer = this.scrollContainer!.nativeElement;

    if (!groupChatContainer) return;

    const config = { childList: true, subtree: false }; 
    const observer = new MutationObserver(() => {
      this.scrollToBottom();  

    });

    observer.observe(groupChatContainer, config);

    this.groupChatObserver = observer;

  }

  disconnectGroupChat() {
    if (this.groupChatObserver) {
      console.log(this.groupChatObserver, 'observer off')
      this.groupChatObserver.disconnect(); 
    }

  }


  ngOnInit(): void {
    this.userImages = [];
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id') || '';
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
    })
  }

  checkIfBackToMainGroupChat() {
    const currentUrl = this.router.url;

    const isThreadOpen = currentUrl.includes('/group-answer/'); 

    if (!isThreadOpen) {
      return true
  } else{
    return false
  }
}

  isFirstMessageOfDay(currentMessage: any, index: number): boolean {
    if (index === 0) {
      return true; 
    }

    const previousMessage = this.messages[index - 1];


    const currentDate = this.parseGermanDate(currentMessage.timestamp);
    const previousDate = this.parseGermanDate(previousMessage.timestamp);


    if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
      console.error('Invalid date format:', currentMessage.timestamp, previousMessage.timestamp);
      return false;
    }


    return currentDate.toDateString() !== previousDate.toDateString();
  }


  parseGermanDate(dateString: string): Date {

    const datePart = dateString.split(', ')[1]; 
    const [day, month, year] = datePart.split('.');

    return new Date(`${year}-${month}-${day}`);
  }

  loadMessages(): void {
    if (this.groupId) {
      this.firebaseService.getChannelsMessages(this.groupId).subscribe(
        (channelData: any[]) => {
          this.messages = this.formatMessages(channelData); 
          console.log("Geladene Nachrichten mit Smileys:", this.messages);
        },
        (error: any) => {
          console.error('Fehler beim Abrufen der Nachrichten:', error);
        }
      );
    }
  }

  formatMessageTime(timestamp: any): string {
    const date = timestamp.toDate(); 
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',    
      minute: '2-digit', 

    });
  }

  formatMessages(messages: any[]): any[] {
    let previousDate: string = "";

    return messages.map((message, index) => {
      const currentDate = this.formatTimestamp(message.timestamp); 
      const isFirstMessageOfDay = currentDate !== previousDate; 

      previousDate = currentDate; 

      return {
        ...message,
        timestamp: isFirstMessageOfDay ? currentDate : null, 
        time: this.formatMessageTime(message.timestamp)      
      };
    });
  }

  formatTimestamp(timestamp: any): string {
    const date = timestamp.toDate(); 
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);


    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    }

    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    }

    else {
      return date.toLocaleDateString('de-DE', { 
        weekday: 'long',  
        day: '2-digit',   
        month: '2-digit', 
        year: 'numeric'   
      });
    }
  }

  loadUserChats(): void {
    if (this.selectedUserId) {
      this.firebaseService.getChatsForUser(this.selectedUserId).subscribe(
        (chats: ChatMessage[]) => {
          this.userChats = chats;
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
          this.loggedInUserName = this.user.name; 
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }

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
        const userIds = channelData.users;  
        const userPromises = userIds.map((userId: string) => this.firebaseService.getUserById(userId));
        const users = await Promise.all(userPromises);

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
      data: {
        channelID: this.groupId,
      }

    });
   
  }

  openDialogAddMember() {
    this.openDialogMemberList();
  }

  showAddMembersMenu(){
    this.dialog.open(DialogChannelAddMembersComponent, {
      panelClass: 'border-30-right',

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

  }

  async loadUserImages(userIds: string[]) {
    const currentChannel = this.groupId;
    this.userImages = [];

    for (const userId of userIds) {
      const userData = await this.firebaseService.getUserById(userId);
      if (userData && currentChannel == this.groupId) {
        this.userImages.push(userData.img)

      }
    }
  }

  editText(messageId: string) {
    this.isEditing[messageId] = true;  
    const currentText = this.messages.find(msg => msg.id === messageId)?.text;  
    if (currentText) {
      this.editedMessageText[messageId] = currentText; 
    }

  }

  saveText(messageId: string) {
    this.isEditing[messageId] = false; 
    const newText = this.messages.find(msg => msg.id === messageId)?.text;  
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
      const lastChat = message.chats[message.chats.length - 1];

      let timeString = lastChat.time; 

      const timePattern = /^\d{2}:\d{2}:\d{2}$/;
      if (timePattern.test(timeString)) {
        const [hours, minutes] = timeString.split(':');


        return `${hours}:${minutes}`;
      } else {
        console.error('Invalid chat time format:', timeString);
        return null; 
      }
    }

    return null;
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

            if (Array.isArray(smiley.clickedBy)) {
                existingSmiley.clickedBy.push(...smiley.clickedBy);
            } else {
                existingSmiley.clickedBy.push(smiley.clickedBy);
            }
            existingSmiley.count = existingSmiley.clickedBy.length; 
        } else {
            groupedSmileys.push({
                smiley: smiley.smiley,
                clickedBy: Array.isArray(smiley.clickedBy) ? [...smiley.clickedBy] : [smiley.clickedBy],
                count: Array.isArray(smiley.clickedBy) ? smiley.clickedBy.length : 1, 
            });
        }
    });

    return groupedSmileys;
}



  toggleEmojiPicker(messageId: string): void {
    this.emojiPickerVisibility[messageId] = !this.emojiPickerVisibility[messageId];
  }


  isEmojiPickerVisible(messageId: string): boolean {
    return !!this.emojiPickerVisibility[messageId]; 
  }

  selectSmiley() {
    this.emojiPickerVisible = !this.emojiPickerVisible; 
  }
  
  addSmileyToGroup(smileyGroup: any, message: any) {
    const userIndex = smileyGroup.clickedBy.indexOf(this.loggedInUserName);

    if (userIndex === -1) {
      
      smileyGroup.clickedBy.push(this.loggedInUserName);
      smileyGroup.count++; 
    } else {

      smileyGroup.clickedBy.splice(userIndex, 1);
      smileyGroup.count--;
    }
  

  }

  addEmoji(event: any, messageId: string) {
    const emoji = event.emoji.native;
    console.log("Selected Emoji:", emoji, "for message:", messageId);

    this.saveSmileyToMessage(emoji, messageId);
    this.closeEmojiSelection();

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
    let clickedByCopy = [...clickedBy]; 
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


