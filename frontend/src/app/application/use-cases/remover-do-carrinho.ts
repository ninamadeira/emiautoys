import type { Carrinho } from '../domain/modelos';
import type { GatewayCarrinho } from '../ports/out/gateway-carrinho';

export class RemoverDoCarrinho {
  constructor(private readonly gatewayCarrinho: GatewayCarrinho) {}

  executar(produtoId: string): Promise<Carrinho> {
    return this.gatewayCarrinho.remover(produtoId);
  }
}
