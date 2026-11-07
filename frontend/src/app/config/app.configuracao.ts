import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZoneChangeDetection, type ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { URL_BASE_API } from '../adapters/out/http/url-base-api';
import { interceptadorAutenticacao } from '../adapters/out/http/autenticacao.interceptor';
import { rotas } from './app.rotas';
import { PROVEDORES_APLICACAO } from './provedores';

export const configuracaoApp: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(rotas, withComponentInputBinding()),
    provideHttpClient(withInterceptors([interceptadorAutenticacao])),
    { provide: URL_BASE_API, useValue: '/api' },
    ...PROVEDORES_APLICACAO,
  ],
};
