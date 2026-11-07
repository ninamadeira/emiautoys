import { criarEnderecoEntrega } from '../domain/endereco.js';
import { ErroPagamentoRecusado } from '../domain/erros.js';
import { criarPedido } from '../domain/pedido.js';
import { exigirMeioPagamento } from '../domain/pagamento.js';

export class FinalizarPedido {
  #cotarPedido;
  #gatewayPagamento;
  #repositorioProduto;
  #repositorioPedido;
  #repositorioCarrinho;
  #geradorId;
  #clock;

  constructor(dependencies) {
    this.#cotarPedido = dependencies.cotarPedido;
    this.#gatewayPagamento = dependencies.gatewayPagamento;
    this.#repositorioProduto = dependencies.repositorioProduto;
    this.#repositorioPedido = dependencies.repositorioPedido;
    this.#repositorioCarrinho = dependencies.repositorioCarrinho;
    this.#geradorId = dependencies.geradorId;
    this.#clock = dependencies.clock;
  }

  async executar(command) {
    const enderecoEntrega = criarEnderecoEntrega(command.enderecoEntrega);
    const method = exigirMeioPagamento(command.meioPagamento);
    const cotacao = await this.#cotacaoPara(command, enderecoEntrega);
    const pedidoId = this.#geradorId.proximo();
    const pagamento = await this.#reservarEstoqueECobrar({
      pedidoId,
      cotacao,
      pagamento: { method, token: command.tokenPagamento },
    });
    const pedido = criarPedido({
      ...cotacao,
      id: pedidoId,
      usuarioId: command.usuarioId,
      enderecoEntrega,
      pagamento,
      criadoEm: this.#clock.agora(),
    });
    await this.#repositorioPedido.salvar(pedido);
    await this.#repositorioCarrinho.limpar(command.usuarioId);
    return pedido;
  }

  #cotacaoPara(command, enderecoEntrega) {
    return this.#cotarPedido.executar({
      usuarioId: command.usuarioId,
      cep: enderecoEntrega.cep,
      codigoCupom: command.codigoCupom,
    });
  }

  async #reservarEstoqueECobrar({ pedidoId, cotacao, pagamento }) {
    const linhasReservadas = await this.#reservarEstoque(cotacao.linhas);
    try {
      return await this.#cobrar({ pedidoId, cotacao, pagamento });
    } catch (erro) {
      await this.#liberarEstoque(linhasReservadas);
      throw erro;
    }
  }

  async #reservarEstoque(linhas) {
    const linhasReservadas = [];
    try {
      for (const linha of linhas) {
        await this.#repositorioProduto.reservarEstoque(linha);
        linhasReservadas.push(linha);
      }
    } catch (erro) {
      await this.#liberarEstoque(linhasReservadas);
      throw erro;
    }
    return linhasReservadas;
  }

  async #liberarEstoque(linhas) {
    for (const linha of linhas) {
      await this.#repositorioProduto.liberarEstoque(linha);
    }
  }

  async #cobrar({ pedidoId, cotacao, pagamento }) {
    const resultado = await this.#gatewayPagamento.cobrar({
      pedidoId,
      valorCentavos: cotacao.totalCentavos,
      method: pagamento.method,
      token: pagamento.token,
    });
    if (!resultado.aprovado) {
      throw new ErroPagamentoRecusado();
    }
    return { method: pagamento.method, transacaoId: resultado.transacaoId };
  }
}
