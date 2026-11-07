import { defineConfig } from '@playwright/test';

const URL_BACKEND = 'http://127.0.0.1:3000/api/saude';
const URL_FRONTEND = 'http://localhost:4200';
const TEMPO_LIMITE_INICIO_SERVIDOR_MS = 120_000;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: URL_FRONTEND, locale: 'pt-BR', trace: 'retain-on-failure' },
  // Sobe a API (banco em memória, catálogo de exemplo) e o Angular. Reaproveita servidores já abertos.
  webServer: [
    {
      command: 'npm start',
      cwd: '../backend',
      url: URL_BACKEND,
      reuseExistingServer: true,
      timeout: TEMPO_LIMITE_INICIO_SERVIDOR_MS,
      env: {
        PORT: '3000',
        ARQUIVO_BANCO: ':memory:',
        CARREGAR_CATALOGO_INICIAL: 'true',
        SEGREDO_TOKEN: 'e2e-secret-with-enough-length-0123456789',
      },
    },
    {
      command: 'npm start',
      url: URL_FRONTEND,
      reuseExistingServer: true,
      timeout: TEMPO_LIMITE_INICIO_SERVIDOR_MS,
    },
  ],
});
