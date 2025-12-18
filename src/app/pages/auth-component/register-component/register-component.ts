import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordRegex, phoneNumberRegex } from '../../../shared/models/auth.model';
import { matchPasswords } from './register.validator';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterLink } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-component',
  imports: [
    ReactiveFormsModule,
    MessageModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    RouterLink,
    PasswordModule,
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  providers: [MessageService],
})
export class RegisterComponent {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  loading = signal(false);

  registerForm = new FormGroup(
    {
      userName: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
        nonNullable: true,
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
      phone: new FormControl('', {
        validators: [Validators.required, Validators.pattern(phoneNumberRegex)],
        nonNullable: true,
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.pattern(passwordRegex)],
        nonNullable: true,
      }),
      confirmPassword: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    },
    {
      validators: matchPasswords('password', 'confirmPassword'),
    },
  );

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { userName, email, phone, password } = this.registerForm.value;

    if (!userName || !email || !phone || !password) {
      return;
    }

    this.loading.set(true);

    this._authService
      .register({
        userName,
        email,
        phone,
        password,
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
            detail: error?.message ?? 'An error occurred during registration.',
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
