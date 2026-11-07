import { ErroDaAplicacao } from '../../src/app/application/domain/erro-da-aplicacao';
import type { Carrinho, Pedido, Produto, Cotacao, Sessao, Usuario } from '../../src/app/application/domain/modelos';
import { GatewayConta } from '../../src/app/application/ports/out/gateway-conta';
import { GatewayAutenticacao, type Credenciais, type Cadastro } from '../../src/app/application/ports/out/gateway-autenticacao';
import { GatewayCarrinho } from '../../src/app/application/ports/out/gateway-carrinho';
import { GatewayFinalizacao, type RequisicaoRealizarPedido, type RequisicaoCotacao } from '../../src/app/application/ports/out/gateway-finalizacao';
import { GatewayProduto } from '../../src/app/application/ports/out/gateway-produto';
import { ArmazenamentoSessao } from '../../src/app/application/ports/out/armazenamento-sessao';

export const USUARIO: Usuario = { id: 'u1', nome: 'Maria', email: 'maria@example.com' };
export const CARRINHO_VAZIO: Carrinho = { linhas: [], subtotalCentavos: 0, totalUnidades: 0 };

export const PRODUTO: Produto = {
  id: 'p1',
  nome: 'Varinha',
  descricao: 'Descrição',
  categoria: 'VARINHA',
  precoCentavos: 2990,
  estoque: 5,
  faixaEtariaIndicada: 'TODAS_AS_IDADES',
  avisoSeguranca: 'Supervisione',
  urlImagem: '/imagens/p1.webp',
};

export class GatewayProdutoFalso extends GatewayProduto {
  ultimaCategoria: string | undefined;
  async listar(categoria?: string): Promise<Produto[]> {
    this.ultimaCategoria = categoria;
    return [PRODUTO];
  }
  async obter(produtoId: string): Promise<Produto> {
    if (produtoId !== PRODUTO.id) throw new ErroDaAplicacao('PRODUTO_NAO_ENCONTRADO');
    return PRODUTO;
  }
}

export class GatewayAutenticacaoFalso extends GatewayAutenticacao {
  cadastros: Cadastro[] = [];
  async cadastrar(cadastro: Cadastro): Promise<Usuario> {
    this.cadastros.push(cadastro);
    return USUARIO;
  }
  async entrar(credenciais: Credenciais): Promise<Sessao> {
    if (credenciais.senha !== 'miau1234') throw new ErroDaAplicacao('CREDENCIAIS_INVALIDAS');
    return { token: 'token-1', usuario: USUARIO };
  }
}

export class ArmazenamentoSessaoFalso extends ArmazenamentoSessao {
  atual: Sessao | undefined;
  carregar(): Sessao | undefined {
    return this.atual;
  }
  salvar(sessao: Sessao): void {
    this.atual = sessao;
  }
  limpar(): void {
    this.atual = undefined;
  }
}

export class GatewayCarrinhoFalso extends GatewayCarrinho {
  calls: string[] = [];
  async obter(): Promise<Carrinho> {
    this.calls.push('get');
    return CARRINHO_VAZIO;
  }
  async adicionar(produtoId: string, quantidade: number): Promise<Carrinho> {
    this.calls.push(`add:${produtoId}:${quantidade}`);
    return CARRINHO_VAZIO;
  }
  async atualizar(produtoId: string, quantidade: number): Promise<Carrinho> {
    this.calls.push(`update:${produtoId}:${quantidade}`);
    return CARRINHO_VAZIO;
  }
  async remover(produtoId: string): Promise<Carrinho> {
    this.calls.push(`remove:${produtoId}`);
    return CARRINHO_VAZIO;
  }
}

export class GatewayFinalizacaoFalso extends GatewayFinalizacao {
  requisicoesCotacao: RequisicaoCotacao[] = [];
  requisicoesPedido: RequisicaoRealizarPedido[] = [];
  async cotacao(requisicao: RequisicaoCotacao): Promise<Cotacao> {
    this.requisicoesCotacao.push(requisicao);
    return { linhas: [], subtotalCentavos: 0, descontoCentavos: 0, freteCentavos: 0, totalCentavos: 0 };
  }
  async realizar(requisicao: RequisicaoRealizarPedido): Promise<Pedido> {
    this.requisicoesPedido.push(requisicao);
    return { id: 'o1' } as Pedido;
  }
  async listarPedidos(): Promise<Pedido[]> {
    return [];
  }
}

export class GatewayContaFalso extends GatewayConta {
  deleted = false;
  async excluirConta(): Promise<void> {
    this.deleted = true;
  }
}
