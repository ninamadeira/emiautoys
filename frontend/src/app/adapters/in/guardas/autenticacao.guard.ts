import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { EstadoSessao } from '../estado/sessao.estado';

export const guardaAutenticacao: CanActivateFn = (_rota, estado) => {
  const sessao = inject(EstadoSessao);
  sessao.sincronizarComArmazenamento();
  if (sessao.estaAutenticado()) return true;
  return inject(Router).createUrlTree(['/entrar'], { queryParams: { retorno: estado.url } });
};
