import type { Carrinho } from '../../domain/modelos';

export abstract class GatewayCarrinho {
  abstract obter(): Promise<Carrinho>;
  abstract adicionar(produtoId: string, quantidade: number): Promise<Carrinho>;
  abstract atualizar(produtoId: string, quantidade: number): Promise<Carrinho>;
  abstract remover(produtoId: string): Promise<Carrinho>;
}
