import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { ThemeComponent } from './theme-component/theme-component';
import { LogoutComponent } from './logout-component/logout-component';

@Component({
  selector: 'app-navigation-drawer-component',
  imports: [
    ButtonModule,
    DrawerModule,
    AvatarModule,
    RippleModule,
    ThemeComponent,
    LogoutComponent,
  ],
  templateUrl: './navigation-drawer-component.html',
  styleUrl: './navigation-drawer-component.css',
})
export class NavigationDrawerComponent {
  navigationDrawerVisible = signal(false);
}
