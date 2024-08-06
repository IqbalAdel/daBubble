import { Component } from '@angular/core';
<<<<<<< HEAD
import { DevspaceComponent } from '../devspace/devspace.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { HeaderComponent } from './header/header.component';
=======
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { DevspaceComponent } from '../devspace/devspace.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
>>>>>>> fa7127f689e3d4fb8ca657f85fa50054df8bbc4c

@Component({
  selector: 'app-main',
  standalone: true,
<<<<<<< HEAD
  imports: [DevspaceComponent, GroupChatComponent,MainComponent,HeaderComponent],
=======
  imports: [
    RouterLink,
    RouterOutlet,
    HeaderComponent,
    DevspaceComponent,
    MatIcon,
    MatIconModule,
  ],
>>>>>>> fa7127f689e3d4fb8ca657f85fa50054df8bbc4c
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
