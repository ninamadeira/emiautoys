import type { Routes } from '@angular/router';
import { guardaAdministrador } from '../adapters/in/guardas/administrador.guard';
import { guardaAutenticacao } from '../adapters/in/guardas/autenticacao.guard';

/** URLs públicas em português (SEO/usabilidade); identificadores também em português (ADR 0006). */
export const rotas: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'loja' },
  {
    path: 'loja',
    title: 'Loja — eMiauToys',
    loadComponent: () => import('../adapters/in/ui/pagina-produtos').then((module) => module.PaginaProdutos),
  },
  {
    path: 'loja/:produtoId',
    title: 'Produto — eMiauToys',
    loadComponent: () => import('../adapters/in/ui/pagina-detalhe-produto').then((module) => module.PaginaDetalheProduto),
  },
  {
    path: 'carrinho',
    title: 'Carrinho — eMiauToys',
    canActivate: [guardaAutenticacao],
    loadComponent: () => import('../adapters/in/ui/pagina-carrinho').then((module) => module.PaginaCarrinho),
  },
  {
    path: 'entrar',
    title: 'Entrar — eMiauToys',
    loadComponent: () => import('../adapters/in/ui/pagina-entrar').then((module) => module.PaginaEntrar),
  },
  {
    path: 'cadastro',
    title: 'Criar conta — eMiauToys',
    loadComponent: () => import('../adapters/in/ui/pagina-cadastro').then((module) => module.PaginaCadastro),
  },
  {
    path: 'finalizar-compra',
    title: 'Finalizar compra — eMiauToys',
    canActivate: [guardaAutenticacao],
    loadComponent: () => import('../adapters/in/ui/pagina-finalizacao').then((module) => module.PaginaFinalizacao),
  },
  {
    path: 'conta',
    title: 'Minha conta — eMiauToys',
    canActivate: [guardaAutenticacao],
    loadComponent: () => import('../adapters/in/ui/pagina-conta').then((module) => module.PaginaConta),
  },
  {
    path: 'administracao',
    title: 'Administração — eMiauToys',
    canActivate: [guardaAdministrador],
    loadComponent: () => import('../adapters/in/ui/pagina-administracao').then((module) => module.PaginaAdministracao),
  },
  {
    path: '**',
    title: 'Página não encontrada — eMiauToys',
    loadComponent: () => import('../adapters/in/ui/pagina-nao-encontrada').then((module) => module.PaginaNaoEncontrada),
  },
];
