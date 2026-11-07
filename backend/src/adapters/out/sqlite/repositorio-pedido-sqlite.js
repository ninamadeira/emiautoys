import { criarPedido } from '../../../application/domain/pedido.js';

function paraPedido(registro) {
  return criarPedido({
    id: registro.id,
    usuarioId: registro.usuario_id,
    linhas: JSON.parse(registro.linhas_json),
    subtotalCentavos: registro.subtotal_centavos,
    descontoCentavos: registro.desconto_centavos,
    freteCentavos: registro.frete_centavos,
    codigoCupom: registro.codigo_cupom ?? undefined,
    enderecoEntrega: Object.freeze(JSON.parse(registro.endereco_entrega_json)),
    pagamento: { method: registro.meio_pagamento, transacaoId: registro.transacao_id },
    criadoEm: new Date(registro.criado_em),
  });
}

const SQL_INSERIR_PEDIDO = `INSERT INTO pedidos
  (id, usuario_id, status, subtotal_centavos, desconto_centavos, frete_centavos, total_centavos, codigo_cupom,
   meio_pagamento, transacao_id, endereco_entrega_json, linhas_json, criado_em)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function paraColunas(pedido) {
  return [
    pedido.id,
    pedido.usuarioId,
    pedido.status,
    pedido.subtotalCentavos,
    pedido.descontoCentavos,
    pedido.freteCentavos,
    pedido.totalCentavos,
    pedido.codigoCupom ?? null,
    pedido.pagamento.method,
    pedido.pagamento.transacaoId,
    JSON.stringify(pedido.enderecoEntrega),
    JSON.stringify(pedido.linhas),
    pedido.criadoEm.toISOString(),
  ];
}

export class RepositorioPedidoSqlite {
  #banco;

  constructor(banco) {
    this.#banco = banco;
  }

  async salvar(pedido) {
    this.#banco.prepare(SQL_INSERIR_PEDIDO).run(...paraColunas(pedido));
  }

  async buscarPorUsuarioId(usuarioId) {
    const registros = this.#banco
      .prepare('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY criado_em, id')
      .all(usuarioId);
    return registros.map(paraPedido);
  }

  async excluirPorUsuarioId(usuarioId) {
    this.#banco.prepare('DELETE FROM pedidos WHERE usuario_id = ?').run(usuarioId);
  }
}
