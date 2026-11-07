import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { Carrinho } from '../domain/modelos';
import type { GatewayCarrinho } from '../ports/out/gateway-carrinho';

export class AdicionarAoCarrinho {
  constructor(private readonly gatewayCarrinho: GatewayCarrinho) {}

  async executar(produtoId: string, quantidade: number): Promise<Carrinho> {
    if (!Number.isInteger(quantidade) || quantidade <= 0) throw erroValidacao('quantidade', 'INTEIRO_POSITIVO_OBRIGATORIO');
    return this.gatewayCarrinho.adicionar(produtoId, quantidade);
  }
}
