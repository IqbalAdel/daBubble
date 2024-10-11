import { Component, HostListener, OnInit, ViewChild } from '@angular/core';

import { GroupChatComponent } from '../group-chat/group-chat.component';
import { HeaderComponent } from './header/header.component';
import { DevspaceComponent } from '../devspace/devspace.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { SoloChatComponent } from '../solo-chat/solo-chat.component';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators'; 
import { GroupAnswerComponent } from '../group-answer/group-answer.component';
import { DialogProfileMobileMenuComponent } from '../dialogs/dialog-profile-mobile-menu/dialog-profile-mobile-menu.component';
import { NewMessageComponent } from '../new-message/new-message.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, GroupChatComponent,MainComponent,HeaderComponent,CommonModule,SoloChatComponent, RouterModule, GroupAnswerComponent, DialogProfileMobileMenuComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent{

channelID = '';
isMainRoute: boolean = false;
openMenu: boolean = false;
showMenu: boolean = false;
userEnteredChannel: boolean = false;
isMobile: boolean = false;
hasMobileTriggered: boolean = false;
chat: any;
chatBoxHasLoaded: boolean = false;
supportsTouch: boolean = 'ontouchstart' in window || navigator.maxTouchPoints > 0;


groupAnswerComponent: GroupAnswerComponent | null = null;
newMessageComponent: NewMessageComponent | null = null;
groupChatComponent: GroupChatComponent | null = null;
soloChatComponent: SoloChatComponent | null = null;
@ViewChild(HeaderComponent) headerComponent!: HeaderComponent;


constructor(public userService:UserService,
  private router: Router, private route: ActivatedRoute){}

ngOnInit(): void {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.isMainRoute = this.router.url.startsWith('/main')
      this.checkForGroupAnswerComponent(this.route);
    })

    this.isMobile = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {

    if (window.innerWidth <= 992) {   
      if (!this.hasMobileTriggered) { 
        this.isMobile = true;
        if(this.chatBoxHasLoaded)

        this.closeDevSpace(true)
        this.hasMobileTriggered = true; 
      }
    } else if (window.innerWidth > 992) {
      this.closeDevSpace(false)
      setTimeout(() => {
        if(this.chat instanceof GroupChatComponent){
          this.groupChatComponent!.scrollToBottom();
          this.groupChatComponent!.observeGroupChat();
        } else if(this.chat instanceof SoloChatComponent){
          this.soloChatComponent!.scrollToBottom();
          this.soloChatComponent!.observeMutations();
        }
      }, 100);
      this.isMobile = false;
      if(this.chatBoxHasLoaded){
        this.chat.isMobile = false;

      }
      this.hasMobileTriggered = false; 
    }
  
  }

  checkForGroupAnswerComponent(route: ActivatedRoute) {

    let activeRoute = route;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;

      if (activeRoute.component === GroupAnswerComponent) {
        if(this.chatBoxHasLoaded && this.groupChatComponent && ( window.innerWidth <= 992) ){
          this.groupChatComponent.threadOpen = true;
        console.log('GroupAnswerComponent is activated in mobile');

        }
        console.log('GroupAnswerComponent is activated');
      }

      
    }

  }

  
  closeDevSpace(status: boolean){
    this.userEnteredChannel = status;
    this.chatBoxHasLoaded = this.chat instanceof GroupChatComponent || this.chat instanceof SoloChatComponent || this.chat instanceof NewMessageComponent;
    if(this.chatBoxHasLoaded && this.userEnteredChannel){
      console.log(status, 'user entered channel')
      setTimeout(() => {
        this.chat.isMobile = false;
      }, 50);
      this.headerComponent.hasEnteredChannel = true;
      setTimeout(() => {
        if(this.chat instanceof GroupChatComponent){
          this.chat.scrollToBottom();
          this.chat.observeGroupChat();
        }
        if(this.chat instanceof SoloChatComponent){
          this.chat.scrollToBottom();
          this.chat.observeMutations();
        }
      }, 100);
    } else if(!this.userEnteredChannel && this.chatBoxHasLoaded){

      this.userEnteredChannel = false
      if (this.chat instanceof GroupChatComponent) {
        this.chat.isMobile = true;
      }
      this.headerComponent.hasEnteredChannel = false;
    }
  }

  onActivate(componentRef: any) {
    if (componentRef instanceof GroupChatComponent) {
      this.groupChatComponent = componentRef;
      this.chat = componentRef;
    } else if (componentRef instanceof SoloChatComponent) {
      this.soloChatComponent = componentRef;
      this.chat = componentRef;
    } else if (componentRef instanceof NewMessageComponent) {
      this.newMessageComponent = componentRef;
      this.chat = componentRef;
    } else if (componentRef instanceof GroupAnswerComponent) {
      this.groupAnswerComponent = componentRef;
      this.chat = componentRef;
      console.log('group has answered the call')
    }
  }


  
    openMobMenu(status: boolean){
      this.openMenu = status;
    }

    closeMenu(){
    console.log('signal received');
      if(this.openMenu = true){
        this.openMenu = false;
      }
    }
  
    detectMobileDevice(status: boolean){
      console.log('signal recieved, closing space', status)
      this.isMobile = status;
      
    }
}
