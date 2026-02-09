import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ChatsSidebarComponent } from './chats-sidebar-component/chats-sidebar-component';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationService } from '../../core/services/navigation-service';
import { isPlatformBrowser } from '@angular/common';
import { debounceTime, fromEvent, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chats-component',
  imports: [ChatsSidebarComponent, RouterOutlet],
  templateUrl: './chats-component.html',
  styleUrl: './chats-component.css',
})
export class ChatsComponent implements OnInit {
  private readonly _navigationService = inject(NavigationService);
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly _router = inject(Router);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  isMobile = signal(false);
  sidebarVisible = this._navigationService.sidebarVisible;

  ngOnInit(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._updateMobileState();

    fromEvent(window, 'resize')
      .pipe(
        debounceTime(150),
        tap(() => this._updateMobileState()),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _updateMobileState(): void {
    const previouslyMobileState = this.isMobile();
    const currentlyMobileState = window.innerWidth < this.MOBILE_BREAKPOINT;
    this.isMobile.set(currentlyMobileState);

    const isOnSpecificChat = /\/chats\/.+/.test(this._router.url);

    if (currentlyMobileState && !previouslyMobileState) {
      if (isOnSpecificChat) {
        this._navigationService.showMainContentView();
      }
    }
    if (previouslyMobileState && !currentlyMobileState) {
      this._navigationService.showSidebarView();
    }
  }
}
