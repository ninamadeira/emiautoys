import type { Produto } from '../../domain/modelos';

export abstract class GatewayProduto {
  abstract listar(categoria?: string): Promise<Produto[]>;
  abstract obter(produtoId: string): Promise<Produto>;
}
