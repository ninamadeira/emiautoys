import { ok } from '../respostas.js';

export function rotasSistema() {
  return [{ method: 'GET', path: '/api/saude', tratador: async () => ok({ status: 'ok' }) }];
}
