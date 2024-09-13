import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DevspaceComponent } from './devspace/devspace.component';
import { LoginSectionComponent } from './login-section/login-section.component';
import { CreateAvatarComponent } from './create-avatar/create-avatar.component';
import { MainComponent } from './main/main.component';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { SoloChatComponent } from './solo-chat/solo-chat.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { TestComponent } from './main/test/test.component';
import { ChatComponent } from './chat/chat.component';
import { GroupAnswerComponent } from './group-answer/group-answer.component';


export const routes: Routes = [
  { 
    path: '', component: LoginComponent, 
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Umleitung zur LoginSectionComponent
      { path: 'login', component: LoginSectionComponent }, // Explizite Login-Route
      { path: 'sign-up', component: SignUpComponent },
      { path: 'create-avatar', component: CreateAvatarComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'new-password', component: NewPasswordComponent }
    ] 
  },
  // { 
  //   path: '', component: MainComponent, 
  //   children: [
  //     { path: '', component: LoginSectionComponent },
  //     { path: 'sign-up', component: SignUpComponent },
  //     { path: 'create-avatar', component: CreateAvatarComponent },
  //     { path: 'reset-password', component: ResetPasswordComponent },
  //     { path: 'new-password', component: NewPasswordComponent }

  //   ] 
  // },

  { 
    path: 'main', component: MainComponent, 
    children: [
      { path: '', redirectTo: 'group-chat/pEylXqZMW1zKPIC0VDXL', pathMatch: 'full' },
      
      { 
        path: 'group-chat/:id',component: GroupChatComponent,
        children: [
          { path: 'group-answer/:answerId', component: GroupAnswerComponent }
        ]
      },

      { path: 'chat/:id', component: SoloChatComponent }
    ],
  },

];



