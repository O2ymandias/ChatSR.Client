import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth-component/login-component/login-component';
import { RegisterComponent } from './pages/auth-component/register-component/register-component';
import { ChatsComponent } from './pages/chats-component/chats-component';
import { authGuard } from './core/guards/auth-guard';
import { ChatsMainComponent } from './pages/chats-component/chats-main-component/chats-main-component';
import { EmptyChatStateComponent } from './pages/chats-component/empty-chat-state-component/empty-chat-state-component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chats',
    pathMatch: 'full',
  },

  {
    path: 'chats',
    component: ChatsComponent,
    title: 'Chats',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: EmptyChatStateComponent,
      },
      {
        path: ':chatId',
        component: ChatsMainComponent,
      },
    ],
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
