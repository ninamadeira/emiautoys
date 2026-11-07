import type { Pedido } from '../domain/modelos';
import type { GatewayFinalizacao } from '../ports/out/gateway-finalizacao';

export class ListarPedidos {
  constructor(private readonly gatewayFinalizacao: GatewayFinalizacao) {}

  executar(): Promise<Pedido[]> {
    return this.gatewayFinalizacao.listarPedidos();
  }
}
