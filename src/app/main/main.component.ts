import { Component } from '@angular/core';
import { DevspaceComponent } from '../devspace/devspace.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, GroupChatComponent,MainComponent,HeaderComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
