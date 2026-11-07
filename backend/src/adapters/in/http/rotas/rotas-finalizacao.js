import { criado, ok } from '../respostas.js';
import { rotaAutenticada } from './definir-rota.js';

const cotacao =
  ({ cotarPedido }) =>
  async ({ usuarioId, body }) =>
    ok(await cotarPedido.executar({ usuarioId, cep: body.cep, codigoCupom: body.codigoCupom }));

const finalizacao =
  ({ finalizarPedido }) =>
  async ({ usuarioId, body }) => {
    const pedido = await finalizarPedido.executar({
      usuarioId,
      enderecoEntrega: body.enderecoEntrega,
      codigoCupom: body.codigoCupom,
      meioPagamento: body.meioPagamento,
      tokenPagamento: body.tokenPagamento,
    });
    return criado({ pedido });
  };

const listarPedidos =
  ({ obterPedidos }) =>
  async ({ usuarioId }) =>
    ok({ pedidos: await obterPedidos.executar({ usuarioId }) });

export function rotasFinalizacao(casosDeUso) {
  return [
    rotaAutenticada('POST', '/api/finalizacao/cotacao', cotacao(casosDeUso)),
    rotaAutenticada('POST', '/api/finalizacao', finalizacao(casosDeUso)),
    rotaAutenticada('GET', '/api/pedidos', listarPedidos(casosDeUso)),
  ];
}
