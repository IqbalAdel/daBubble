import { Routes, } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DevspaceComponent } from './devspace/devspace.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    // { path: 'devspace', component: DevspaceComponent },
];


