import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ArmazenamentoSessao } from '../../../application/ports/out/armazenamento-sessao';
import { URL_BASE_API } from './url-base-api';

export const interceptadorAutenticacao: HttpInterceptorFn = (requisicao, proximo) => {
  const token = inject(ArmazenamentoSessao).carregar()?.token;
  const ehChamadaApi = requisicao.url.startsWith(inject(URL_BASE_API));
  if (!token || !ehChamadaApi) return proximo(requisicao);
  return proximo(requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
