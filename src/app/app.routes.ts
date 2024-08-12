import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DevspaceComponent } from './devspace/devspace.component';
import { LoginSectionComponent } from './login-section/login-section.component';
import { CreateAvatarComponent } from './create-avatar/create-avatar.component';
import { MainComponent } from './main/main.component';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { SoloChatComponent } from './solo-chat/solo-chat.component';

export const routes: Routes = [
  { 
    path: '', component: LoginComponent, 
    children: [
      { path: '', component: LoginSectionComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'create-avatar', component: CreateAvatarComponent }
    ] 
  },

  { path: 'main', component: MainComponent },
  { path: 'group-chat/:id/:name', component: GroupChatComponent },
  { path: 'solo-chat/:id', component: SoloChatComponent },
];

