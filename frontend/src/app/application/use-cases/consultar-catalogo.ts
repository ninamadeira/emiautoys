import type { Produto } from '../domain/modelos';
import type { GatewayProduto } from '../ports/out/gateway-produto';

export class ConsultarCatalogo {
  constructor(private readonly gatewayProduto: GatewayProduto) {}

  executar(categoria?: string): Promise<Produto[]> {
    return this.gatewayProduto.listar(categoria);
  }
}
