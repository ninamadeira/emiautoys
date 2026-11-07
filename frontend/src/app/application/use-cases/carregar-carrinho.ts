import type { Carrinho } from '../domain/modelos';
import type { GatewayCarrinho } from '../ports/out/gateway-carrinho';

export class CarregarCarrinho {
  constructor(private readonly gatewayCarrinho: GatewayCarrinho) {}

  executar(): Promise<Carrinho> {
    return this.gatewayCarrinho.obter();
  }
}
