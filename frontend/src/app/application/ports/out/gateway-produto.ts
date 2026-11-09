import type { AlteracaoProduto, DadosProduto, Produto } from '../../domain/modelos';

export abstract class GatewayProduto {
  abstract listar(categoria?: string): Promise<Produto[]>;
  abstract obter(produtoId: string): Promise<Produto>;
  abstract cadastrar(dados: DadosProduto): Promise<Produto>;
  abstract alterar(produtoId: string, alteracao: AlteracaoProduto): Promise<Produto>;
}
