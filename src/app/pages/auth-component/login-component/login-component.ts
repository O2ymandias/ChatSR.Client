import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Error } from '../../../shared/models/shared.model';
import { Router, RouterLink } from '@angular/router';
import { PasswordModule } from 'primeng/password';
@Component({
  selector: 'app-login-component',
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    MessageModule,
    ToastModule,
    RouterLink,
    PasswordModule,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
  providers: [MessageService],
})
export class LoginComponent {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  loading = signal(false);

  loginForm = new FormGroup({
    userNameOrEmail: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),

    password: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { userNameOrEmail, password } = this.loginForm.value;

    if (!userNameOrEmail || !password) {
      return;
    }

    this.loading.set(true);

    this._authService
      .login({
        userNameOrEmail: userNameOrEmail,
        password: password,
      })
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) {
            this._router.navigate(['/home']);
            const userInfo = res.data.userInfo;
            this._messageService.add({
              key: 'br',
              severity: 'success',
              summary: 'Success',
              detail: `Welcome ${userInfo.displayName}.`,
            });
          }
        }),

        catchError((httpErrorResponse: HttpErrorResponse) => {
          const error: Error = httpErrorResponse.error.error;
          this._messageService.add({
            key: 'br',
            severity: 'error',
            summary: 'Error',
            detail: error?.message ?? 'An error occurred while logging in.',
          });
          return throwError(() => httpErrorResponse);
        }),

        finalize(() => {
          this.loading.set(false);
        }),

        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
