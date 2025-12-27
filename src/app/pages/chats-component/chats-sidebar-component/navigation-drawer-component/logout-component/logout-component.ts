import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../../core/services/auth-service';

@Component({
  selector: 'app-logout-component',
  imports: [ButtonModule],
  templateUrl: './logout-component.html',
  styleUrl: './logout-component.css',
})
export class LogoutComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  logout(): void {
    this._authService.logout();
    this._router.navigate(['/auth', 'login']);
  }
}
