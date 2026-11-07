import { bootstrapApplication } from '@angular/platform-browser';
import { Aplicacao } from './app/adapters/in/ui/estrutura-app';
import { configuracaoApp } from './app/config/app.configuracao';

bootstrapApplication(Aplicacao, configuracaoApp).catch((erro: unknown) => {
  document.body.textContent = 'Não foi possível iniciar a loja. Recarregue a página.';
  throw erro;
});
