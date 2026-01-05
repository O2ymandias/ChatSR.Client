import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private _sidebarVisible = signal(true);

  sidebarVisible = this._sidebarVisible.asReadonly();

  showMainContentView(): void {
    this._sidebarVisible.set(false);
  }

  showSidebarView(): void {
    this._sidebarVisible.set(true);
  }
}
