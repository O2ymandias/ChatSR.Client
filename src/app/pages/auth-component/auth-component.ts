import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme-service';
import { BrandPanelComponent } from './brand-panel-component/brand-panel-component';

@Component({
  selector: 'app-auth-component',
  imports: [RouterOutlet, BrandPanelComponent],
  templateUrl: './auth-component.html',
  styleUrl: './auth-component.css',
})
export class AuthComponent {
  private readonly _themeService = inject(ThemeService);

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  isDarkMode = computed(() => this._themeService.currentTheme() === 'dark');
}
