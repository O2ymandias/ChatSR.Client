import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme-service';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-brand-panel-component',
  imports: [RippleModule],
  templateUrl: './brand-panel-component.html',
  styleUrl: './brand-panel-component.css',
})
export class BrandPanelComponent {
  private readonly _themeService = inject(ThemeService);

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  isDarkMode = computed(() => this._themeService.currentTheme() === 'dark');
}
