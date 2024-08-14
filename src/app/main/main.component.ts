import { Component, OnInit } from '@angular/core';

import { GroupChatComponent } from '../group-chat/group-chat.component';
import { HeaderComponent } from './header/header.component';
import { DevspaceComponent } from '../devspace/devspace.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { SoloChatComponent } from '../solo-chat/solo-chat.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, GroupChatComponent,MainComponent,HeaderComponent,CommonModule,SoloChatComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{

  channelID = "";
constructor(public userService:UserService, private route: ActivatedRoute){}

ngOnInit(): void {
  this.route.paramMap.subscribe(paramMap => {
    this.channelID = paramMap.get('id')!;
    console.log('channel: ',this.channelID)
  });


    // Update any other component logic that depends on groupId or groupName
  }
}
