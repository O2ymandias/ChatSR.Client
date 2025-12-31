import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { initializeChatHub } from './core/initializers/initialize-chat-hub';
import { attachTokenInterceptor } from './core/interceptors/attach-token-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // withViewTransitions(),
      // withInMemoryScrolling({
      //   scrollPositionRestoration: 'top',
      // }),
    ),
    provideHttpClient(withFetch(), withInterceptors([attachTokenInterceptor])),
    provideClientHydration(withEventReplay()),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
          darkModeSelector: '.dark',
        },
      },
      ripple: true,
    }),
    provideAppInitializer(initializeChatHub),
  ],
};
