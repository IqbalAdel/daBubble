import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { DevspaceComponent } from "./devspace/devspace.component";
import { MainComponent } from './main/main.component';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { TestComponent } from './main/test/test.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule, RouterLink, MainComponent, GroupChatComponent, TestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 
  title = 'daBubble';
  constructor(private router: Router) { }
  

}
