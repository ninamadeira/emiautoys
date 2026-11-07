export type CategoriaProduto = 'VARINHA' | 'BOLINHA' | 'ARRANHADOR' | 'TUNEL' | 'CATNIP' | 'INTERATIVO';
export type FaixaEtariaGato = 'FILHOTE' | 'ADULTO' | 'IDOSO' | 'TODAS_AS_IDADES';
export type MeioPagamento = 'PIX' | 'BOLETO' | 'CARTAO';

export const CATEGORIAS_PRODUTO: readonly CategoriaProduto[] = [
  'VARINHA',
  'BOLINHA',
  'ARRANHADOR',
  'TUNEL',
  'CATNIP',
  'INTERATIVO',
];

export const MEIOS_PAGAMENTO: readonly MeioPagamento[] = ['PIX', 'BOLETO', 'CARTAO'];

export interface Produto {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly categoria: CategoriaProduto;
  readonly precoCentavos: number;
  readonly estoque: number;
  readonly faixaEtariaIndicada: FaixaEtariaGato;
  readonly avisoSeguranca: string;
  readonly urlImagem: string;
}

export interface LinhaPedido {
  readonly produtoId: string;
  readonly nome: string;
  readonly precoUnitarioCentavos: number;
  readonly quantidade: number;
  readonly totalLinhaCentavos: number;
}

export interface Carrinho {
  readonly linhas: readonly LinhaPedido[];
  readonly subtotalCentavos: number;
  readonly totalUnidades: number;
}

export interface Usuario {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
}

export interface Sessao {
  readonly token: string;
  readonly usuario: Usuario;
}

export interface EnderecoEntrega {
  readonly nomeDestinatario: string;
  readonly cep: string;
  readonly rua: string;
  readonly numero: string;
  readonly complemento: string;
  readonly cidade: string;
  readonly estado: string;
}

export interface Cotacao {
  readonly linhas: readonly LinhaPedido[];
  readonly subtotalCentavos: number;
  readonly descontoCentavos: number;
  readonly freteCentavos: number;
  readonly totalCentavos: number;
  readonly codigoCupom?: string;
}

export interface Pedido {
  readonly id: string;
  readonly status: string;
  readonly linhas: readonly LinhaPedido[];
  readonly subtotalCentavos: number;
  readonly descontoCentavos: number;
  readonly freteCentavos: number;
  readonly totalCentavos: number;
  readonly criadoEm: string;
  readonly pagamento: { readonly method: MeioPagamento; readonly transacaoId: string };
}
