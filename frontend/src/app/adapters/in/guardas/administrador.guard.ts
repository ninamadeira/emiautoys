import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { EstadoSessao } from '../estado/sessao.estado';

export const guardaAdministrador: CanActivateFn = (_rota, estado) => {
  const sessao = inject(EstadoSessao);
  const roteador = inject(Router);
  sessao.sincronizarComArmazenamento();
  if (!sessao.estaAutenticado()) return roteador.createUrlTree(['/entrar'], { queryParams: { retorno: estado.url } });
  return sessao.usuario()?.administrador === true ? true : roteador.createUrlTree(['/loja']);
};
