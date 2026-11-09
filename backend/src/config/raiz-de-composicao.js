import { AdicionarItemAoCarrinho } from '../application/use-cases/adicionar-item-ao-carrinho.js';
import { AutenticarUsuario } from '../application/use-cases/autenticar-usuario.js';
import { FinalizarPedido } from '../application/use-cases/finalizar-pedido.js';
import { ExcluirConta } from '../application/use-cases/excluir-conta.js';
import { ObterCarrinho } from '../application/use-cases/obter-carrinho.js';
import { ObterPedidos } from '../application/use-cases/obter-pedidos.js';
import { CadastrarProduto } from '../application/use-cases/cadastrar-produto.js';
import { AlterarProduto } from '../application/use-cases/alterar-produto.js';
import { ObterProduto } from '../application/use-cases/obter-produto.js';
import { ListarProdutos } from '../application/use-cases/listar-produtos.js';
import { CotarPedido } from '../application/use-cases/cotar-pedido.js';
import { CadastrarUsuario } from '../application/use-cases/cadastrar-usuario.js';
import { RemoverItemDoCarrinho } from '../application/use-cases/remover-item-do-carrinho.js';
import { AtualizarItemDoCarrinho } from '../application/use-cases/atualizar-item-do-carrinho.js';
import { VerificarSessao } from '../application/use-cases/verificar-sessao.js';
import { garantirQueImplementaPorta } from '../application/ports/definir-porta.js';
import { RepositorioCarrinho } from '../application/ports/out/repositorio-carrinho.js';
import { Relogio } from '../application/ports/out/relogio.js';
import { RepositorioCupom } from '../application/ports/out/repositorio-cupom.js';
import { GeradorId } from '../application/ports/out/gerador-id.js';
import { RepositorioPedido } from '../application/ports/out/repositorio-pedido.js';
import { GeradorHashSenha } from '../application/ports/out/gerador-hash-senha.js';
import { GatewayPagamento } from '../application/ports/out/gateway-pagamento.js';
import { RepositorioProduto } from '../application/ports/out/repositorio-produto.js';
import { EmissorToken } from '../application/ports/out/emissor-token.js';
import { RepositorioUsuario } from '../application/ports/out/repositorio-usuario.js';
import { criarAutenticador } from '../adapters/in/http/autenticacao.js';
import { criarServidorHttp } from '../adapters/in/http/criar-servidor-http.js';
import { montarRotas } from '../adapters/in/http/rotas/index.js';
import { GatewayPagamentoSimulado } from '../adapters/out/pagamento/gateway-pagamento-simulado.js';
import { EmissorTokenHmac } from '../adapters/out/seguranca/emissor-token-hmac.js';
import { GeradorHashSenhaScrypt } from '../adapters/out/seguranca/gerador-hash-senha-scrypt.js';
import { RepositorioCarrinhoSqlite } from '../adapters/out/sqlite/repositorio-carrinho-sqlite.js';
import { RepositorioCupomSqlite } from '../adapters/out/sqlite/repositorio-cupom-sqlite.js';
import { RepositorioPedidoSqlite } from '../adapters/out/sqlite/repositorio-pedido-sqlite.js';
import { RepositorioProdutoSqlite } from '../adapters/out/sqlite/repositorio-produto-sqlite.js';
import { RepositorioUsuarioSqlite } from '../adapters/out/sqlite/repositorio-usuario-sqlite.js';
import { RegistradorStdout } from '../adapters/out/sistema/registrador-stdout.js';
import { RelogioDoSistema } from '../adapters/out/sistema/relogio-do-sistema.js';
import { GeradorUuid } from '../adapters/out/sistema/gerador-uuid.js';
import { abrirBanco } from './banco.js';
import { carregarCatalogoInicial } from './carregar-catalogo-inicial.js';

const HOST_ESCUTA = '127.0.0.1';

const VINCULOS_PORTAS = [
  ['clock', Relogio],
  ['geradorId', GeradorId],
  ['repositorioProduto', RepositorioProduto],
  ['repositorioUsuario', RepositorioUsuario],
  ['repositorioCarrinho', RepositorioCarrinho],
  ['repositorioCupom', RepositorioCupom],
  ['repositorioPedido', RepositorioPedido],
  ['geradorHashSenha', GeradorHashSenha],
  ['gatewayPagamento', GatewayPagamento],
  ['emissorToken', EmissorToken],
];

function garantirQueAdaptadoresImplementamPortas(adaptadores) {
  for (const [nome, porta] of VINCULOS_PORTAS) {
    garantirQueImplementaPorta(porta, adaptadores[nome]);
  }
}

function montarAdaptadoresSaida({ configuracao, banco }) {
  const clock = new RelogioDoSistema();
  const adaptadores = {
    clock,
    geradorId: new GeradorUuid(),
    repositorioProduto: new RepositorioProdutoSqlite(banco),
    repositorioUsuario: new RepositorioUsuarioSqlite(banco),
    repositorioCarrinho: new RepositorioCarrinhoSqlite(banco),
    repositorioCupom: new RepositorioCupomSqlite(banco),
    repositorioPedido: new RepositorioPedidoSqlite(banco),
    geradorHashSenha: new GeradorHashSenhaScrypt(),
    gatewayPagamento: new GatewayPagamentoSimulado(),
    emissorToken: new EmissorTokenHmac({ segredo: configuracao.segredoToken, clock, ttlSegundos: configuracao.ttlTokenSegundos }),
  };
  garantirQueAdaptadoresImplementamPortas(adaptadores);
  return adaptadores;
}

function montarCasosDeUso(adaptadores, { emailsAdministradores = [] } = {}) {
  const obterCarrinho = new ObterCarrinho(adaptadores);
  const cotarPedido = new CotarPedido(adaptadores);
  return {
    obterCarrinho,
    cotarPedido,
    adicionarItemAoCarrinho: new AdicionarItemAoCarrinho({ ...adaptadores, obterCarrinho }),
    atualizarItemDoCarrinho: new AtualizarItemDoCarrinho({ ...adaptadores, obterCarrinho }),
    removerItemDoCarrinho: new RemoverItemDoCarrinho({ ...adaptadores, obterCarrinho }),
    listarProdutos: new ListarProdutos(adaptadores),
    obterProduto: new ObterProduto(adaptadores),
    cadastrarProduto: new CadastrarProduto({ ...adaptadores, emailsAdministradores }),
    alterarProduto: new AlterarProduto({ ...adaptadores, emailsAdministradores }),
    cadastrarUsuario: new CadastrarUsuario(adaptadores),
    autenticarUsuario: new AutenticarUsuario({ ...adaptadores, emailsAdministradores }),
    verificarSessao: new VerificarSessao(adaptadores),
    excluirConta: new ExcluirConta(adaptadores),
    obterPedidos: new ObterPedidos(adaptadores),
    finalizarPedido: new FinalizarPedido({ ...adaptadores, cotarPedido }),
  };
}

function escutarEm(servidor, porta) {
  return new Promise((resolve, reject) => {
    servidor.once('error', reject);
    servidor.listen(porta, HOST_ESCUTA, resolve);
  });
}

function fecharServidor(servidor) {
  return new Promise((resolve, reject) => {
    servidor.close((erro) => (erro ? reject(erro) : resolve()));
    servidor.closeAllConnections();
  });
}

export async function montarAplicacao(configuracao, { logger = new RegistradorStdout() } = {}) {
  const banco = abrirBanco({ nomeArquivo: configuracao.arquivoBanco });
  const adaptadores = montarAdaptadoresSaida({ configuracao, banco });
  const casosDeUso = montarCasosDeUso(adaptadores, configuracao);
  if (configuracao.carregarCatalogoInicial) {
    await carregarCatalogoInicial(adaptadores);
  }
  const servidor = criarServidorHttp({
    rotas: montarRotas(casosDeUso),
    autenticar: criarAutenticador(casosDeUso),
    logger,
    origemCors: configuracao.origemCors,
  });
  return {
    listen: () => escutarEm(servidor, configuracao.porta),
    porta: () => servidor.address().port,
    async close() {
      await fecharServidor(servidor);
      banco.close();
    },
  };
}
