import { ok } from '../respostas.js';
import { rotaAutenticada } from './definir-rota.js';

const mostrarCarrinho =
  ({ obterCarrinho }) =>
  async ({ usuarioId }) =>
    ok(await obterCarrinho.executar({ usuarioId }));

const adicionarItem =
  ({ adicionarItemAoCarrinho }) =>
  async ({ usuarioId, body }) =>
    ok(await adicionarItemAoCarrinho.executar({ usuarioId, produtoId: body.produtoId, quantidade: body.quantidade }));

const alterarQuantidade =
  ({ atualizarItemDoCarrinho }) =>
  async ({ usuarioId, parametros, body }) =>
    ok(await atualizarItemDoCarrinho.executar({ usuarioId, produtoId: parametros.produtoId, quantidade: body.quantidade }));

const removerItem =
  ({ removerItemDoCarrinho }) =>
  async ({ usuarioId, parametros }) =>
    ok(await removerItemDoCarrinho.executar({ usuarioId, produtoId: parametros.produtoId }));

export function rotasCarrinho(casosDeUso) {
  return [
    rotaAutenticada('GET', '/api/carrinho', mostrarCarrinho(casosDeUso)),
    rotaAutenticada('POST', '/api/carrinho/itens', adicionarItem(casosDeUso)),
    rotaAutenticada('PUT', '/api/carrinho/itens/:produtoId', alterarQuantidade(casosDeUso)),
    rotaAutenticada('DELETE', '/api/carrinho/itens/:produtoId', removerItem(casosDeUso)),
  ];
}
