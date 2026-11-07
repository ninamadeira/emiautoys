import { exigirUmDe } from './validacao.js';

export const MEIOS_PAGAMENTO = Object.freeze(['PIX', 'BOLETO', 'CARTAO']);

export function exigirMeioPagamento(method) {
  return exigirUmDe(method, MEIOS_PAGAMENTO, 'meioPagamento');
}
