import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../../../core/services/theme-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-component',
  imports: [ToggleSwitchModule, FormsModule],
  templateUrl: './theme-component.html',
  styleUrl: './theme-component.css',
})
export class ThemeComponent {
  private readonly _themeService = inject(ThemeService);

  isDarkMode = computed(() => this._themeService.currentTheme() === 'dark');

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }
}
