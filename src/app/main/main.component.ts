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
export class MainComponent{

constructor(public userService:UserService, private route: ActivatedRoute){}
}
