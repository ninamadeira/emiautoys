import { definirPorta } from '../definir-porta.js';

export const RepositorioProduto = definirPorta('RepositorioProduto', [
  'buscarTodos',
  'buscarPorId',
  'buscarPorIds',
  'salvar',
  'reservarEstoque',
  'liberarEstoque',
]);
