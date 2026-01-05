import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ChatsSidebarComponent } from './chats-sidebar-component/chats-sidebar-component';
import { RouterOutlet } from '@angular/router';
import { NavigationService } from '../../core/services/navigation-service';
import { isPlatformBrowser } from '@angular/common';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chats-component',
  imports: [ChatsSidebarComponent, RouterOutlet],
  templateUrl: './chats-component.html',
  styleUrl: './chats-component.css',
})
export class ChatsComponent implements OnInit {
  private readonly _navigationService = inject(NavigationService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _mobileBreakpoint = 768;
  private readonly _destroyRef = inject(DestroyRef);

  isMobile = signal(false);
  sidebarVisible = this._navigationService.sidebarVisible;

  ngOnInit(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._updateMobileState();

    fromEvent(window, 'resize')
      .pipe(debounceTime(150), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateMobileState());
  }

  private _updateMobileState(): void {
    const wasMobile = this.isMobile();
    const isMobile = window.innerWidth < this._mobileBreakpoint;

    this.isMobile.set(isMobile);

    // When switching from desktop to mobile, show sidebar by default
    if (!wasMobile && isMobile) {
      this._navigationService.showSidebarView();
    }

    // When switching from mobile to desktop, ensure sidebar is visible
    if (wasMobile && !isMobile) {
      this._navigationService.showSidebarView();
    }
  }
}
