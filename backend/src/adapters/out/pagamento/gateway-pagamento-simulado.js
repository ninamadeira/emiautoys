export const TOKEN_RECUSADO = 'tok_recusado';

export class GatewayPagamentoSimulado {
  #sequence = 0;

  async cobrar({ pedidoId, method, token }) {
    this.#sequence += 1;
    const foiRecusado = method === 'CARTAO' && (!token || token === TOKEN_RECUSADO);
    return {
      aprovado: !foiRecusado,
      transacaoId: `sim-${pedidoId}-${this.#sequence}`,
    };
  }
}
