import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { AlteracaoProduto, Produto } from '../domain/modelos';
import type { GatewayProduto } from '../ports/out/gateway-produto';

export class AlterarProduto {
  constructor(private readonly gatewayProduto: GatewayProduto) {}

  async executar(produtoId: string, alteracao: AlteracaoProduto): Promise<Produto> {
    const { precoCentavos, estoque } = alteracao;
    if (precoCentavos !== undefined && (!Number.isInteger(precoCentavos) || precoCentavos <= 0)) {
      throw erroValidacao('precoCentavos', 'INTEIRO_POSITIVO_OBRIGATORIO');
    }
    if (estoque !== undefined && (!Number.isInteger(estoque) || estoque < 0)) {
      throw erroValidacao('estoque', 'INTEIRO_NAO_NEGATIVO_OBRIGATORIO');
    }
    return this.gatewayProduto.alterar(produtoId, alteracao);
  }
}
