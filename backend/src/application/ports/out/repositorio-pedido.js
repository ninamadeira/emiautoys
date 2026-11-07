import { definirPorta } from '../definir-porta.js';

export const RepositorioPedido = definirPorta('RepositorioPedido', [
  'salvar',
  'buscarPorUsuarioId',
  'excluirPorUsuarioId',
]);
