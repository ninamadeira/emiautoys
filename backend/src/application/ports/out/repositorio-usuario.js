import { definirPorta } from '../definir-porta.js';

export const RepositorioUsuario = definirPorta('RepositorioUsuario', [
  'buscarPorId',
  'buscarPorEmail',
  'salvar',
  'excluirPorId',
]);
