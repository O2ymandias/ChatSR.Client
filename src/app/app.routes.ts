import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth-component/login-component/login-component';
import { RegisterComponent } from './pages/auth-component/register-component/register-component';
import { HomeComponent } from './pages/home-component/home-component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    title: 'Home',
  },

  {
    path: 'home',
    component: HomeComponent,
    title: 'Home',
  },

  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
      },

      {
        path: 'register',
        component: RegisterComponent,
        title: 'Register',
      },
    ],
  },
];
