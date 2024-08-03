import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DevspaceComponent } from './devspace/devspace.component';
import { LoginSectionComponent } from './login-section/login-section.component';

export const routes: Routes = [
  { 
    path: '', 
    component: LoginComponent, 
    children: [
      { path: '', component: LoginSectionComponent },
      { path: 'sign-up', component: SignUpComponent }
    ] 
  },

//   { path: 'devspace', component: DevspaceComponent },
];

