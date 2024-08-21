import { Component, OnInit } from '@angular/core';

import { GroupChatComponent } from '../group-chat/group-chat.component';
import { HeaderComponent } from './header/header.component';
import { DevspaceComponent } from '../devspace/devspace.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { SoloChatComponent } from '../solo-chat/solo-chat.component';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators'; 

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, GroupChatComponent,MainComponent,HeaderComponent,CommonModule,SoloChatComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent{

channelID = '';
isMainRoute: boolean = false;

constructor(public userService:UserService,
  private router: Router, private route: ActivatedRoute){}

ngOnInit(): void {
  this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.isMainRoute = this.router.url.startsWith('/main')
    })

    // Update any other component logic that depends on groupId or groupName
  }
}
