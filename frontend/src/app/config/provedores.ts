import { inject, type Provider } from '@angular/core';
import { GatewayContaHttp } from '../adapters/out/http/gateway-conta-http';
import { GatewayAutenticacaoHttp } from '../adapters/out/http/gateway-autenticacao-http';
import { GatewayCarrinhoHttp } from '../adapters/out/http/gateway-carrinho-http';
import { GatewayFinalizacaoHttp } from '../adapters/out/http/gateway-finalizacao-http';
import { GatewayProdutoHttp } from '../adapters/out/http/gateway-produto-http';
import { ArmazenamentoSessaoLocalStorage } from '../adapters/out/armazenamento/armazenamento-sessao-local-storage';
import { GatewayConta } from '../application/ports/out/gateway-conta';
import { GatewayAutenticacao } from '../application/ports/out/gateway-autenticacao';
import { GatewayCarrinho } from '../application/ports/out/gateway-carrinho';
import { GatewayFinalizacao } from '../application/ports/out/gateway-finalizacao';
import { GatewayProduto } from '../application/ports/out/gateway-produto';
import { ArmazenamentoSessao } from '../application/ports/out/armazenamento-sessao';
import { AdicionarAoCarrinho } from '../application/use-cases/adicionar-ao-carrinho';
import { CadastrarProduto } from '../application/use-cases/cadastrar-produto';
import { AlterarProduto } from '../application/use-cases/alterar-produto';
import { ConsultarCatalogo } from '../application/use-cases/consultar-catalogo';
import { AlterarQuantidadeItemCarrinho } from '../application/use-cases/alterar-quantidade-item-carrinho';
import { ExcluirConta } from '../application/use-cases/excluir-conta';
import { ObterDetalhesProduto } from '../application/use-cases/obter-detalhes-produto';
import { ListarPedidos } from '../application/use-cases/listar-pedidos';
import { CarregarCarrinho } from '../application/use-cases/carregar-carrinho';
import { RealizarPedido } from '../application/use-cases/realizar-pedido';
import { CotarPedido } from '../application/use-cases/cotar-pedido';
import { CadastrarConta } from '../application/use-cases/cadastrar-conta';
import { RemoverDoCarrinho } from '../application/use-cases/remover-do-carrinho';
import { RestaurarSessao } from '../application/use-cases/restaurar-sessao';
import { Entrar } from '../application/use-cases/entrar';
import { Sair } from '../application/use-cases/sair';

/** Raiz de composição: só aqui as implementações concretas são ligadas às portas. */
const PROVEDORES_PORTAS: Provider[] = [
  { provide: GatewayProduto, useClass: GatewayProdutoHttp },
  { provide: GatewayAutenticacao, useClass: GatewayAutenticacaoHttp },
  { provide: GatewayCarrinho, useClass: GatewayCarrinhoHttp },
  { provide: GatewayFinalizacao, useClass: GatewayFinalizacaoHttp },
  { provide: GatewayConta, useClass: GatewayContaHttp },
  { provide: ArmazenamentoSessao, useClass: ArmazenamentoSessaoLocalStorage },
];

const PROVEDORES_CASOS_DE_USO: Provider[] = [
  { provide: ConsultarCatalogo, useFactory: () => new ConsultarCatalogo(inject(GatewayProduto)) },
  { provide: ObterDetalhesProduto, useFactory: () => new ObterDetalhesProduto(inject(GatewayProduto)) },
  { provide: CadastrarProduto, useFactory: () => new CadastrarProduto(inject(GatewayProduto)) },
  { provide: AlterarProduto, useFactory: () => new AlterarProduto(inject(GatewayProduto)) },
  { provide: Entrar, useFactory: () => new Entrar(inject(GatewayAutenticacao), inject(ArmazenamentoSessao)) },
  { provide: CadastrarConta, useFactory: () => new CadastrarConta(inject(GatewayAutenticacao)) },
  { provide: RestaurarSessao, useFactory: () => new RestaurarSessao(inject(ArmazenamentoSessao)) },
  { provide: Sair, useFactory: () => new Sair(inject(ArmazenamentoSessao)) },
  { provide: ExcluirConta, useFactory: () => new ExcluirConta(inject(GatewayConta), inject(ArmazenamentoSessao)) },
  { provide: CarregarCarrinho, useFactory: () => new CarregarCarrinho(inject(GatewayCarrinho)) },
  { provide: AdicionarAoCarrinho, useFactory: () => new AdicionarAoCarrinho(inject(GatewayCarrinho)) },
  { provide: AlterarQuantidadeItemCarrinho, useFactory: () => new AlterarQuantidadeItemCarrinho(inject(GatewayCarrinho)) },
  { provide: RemoverDoCarrinho, useFactory: () => new RemoverDoCarrinho(inject(GatewayCarrinho)) },
  { provide: CotarPedido, useFactory: () => new CotarPedido(inject(GatewayFinalizacao)) },
  { provide: RealizarPedido, useFactory: () => new RealizarPedido(inject(GatewayFinalizacao)) },
  { provide: ListarPedidos, useFactory: () => new ListarPedidos(inject(GatewayFinalizacao)) },
];

export const PROVEDORES_APLICACAO: Provider[] = [...PROVEDORES_PORTAS, ...PROVEDORES_CASOS_DE_USO];
