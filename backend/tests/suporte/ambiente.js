import { AdicionarItemAoCarrinho } from '../../src/application/use-cases/adicionar-item-ao-carrinho.js';
import { AutenticarUsuario } from '../../src/application/use-cases/autenticar-usuario.js';
import { FinalizarPedido } from '../../src/application/use-cases/finalizar-pedido.js';
import { ExcluirConta } from '../../src/application/use-cases/excluir-conta.js';
import { ObterCarrinho } from '../../src/application/use-cases/obter-carrinho.js';
import { ObterPedidos } from '../../src/application/use-cases/obter-pedidos.js';
import { CadastrarProduto } from '../../src/application/use-cases/cadastrar-produto.js';
import { AlterarProduto } from '../../src/application/use-cases/alterar-produto.js';
import { ObterProduto } from '../../src/application/use-cases/obter-produto.js';
import { ListarProdutos } from '../../src/application/use-cases/listar-produtos.js';
import { CotarPedido } from '../../src/application/use-cases/cotar-pedido.js';
import { CadastrarUsuario } from '../../src/application/use-cases/cadastrar-usuario.js';
import { RemoverItemDoCarrinho } from '../../src/application/use-cases/remover-item-do-carrinho.js';
import { AtualizarItemDoCarrinho } from '../../src/application/use-cases/atualizar-item-do-carrinho.js';
import { VerificarSessao } from '../../src/application/use-cases/verificar-sessao.js';
import { criarProduto } from '../../src/application/domain/produto.js';
import { criarCupom } from '../../src/application/domain/cupom.js';
import { RepositorioCarrinhoEmMemoria } from '../../src/adapters/out/memoria/repositorio-carrinho-em-memoria.js';
import { RepositorioCupomEmMemoria } from '../../src/adapters/out/memoria/repositorio-cupom-em-memoria.js';
import { RepositorioPedidoEmMemoria } from '../../src/adapters/out/memoria/repositorio-pedido-em-memoria.js';
import { RepositorioProdutoEmMemoria } from '../../src/adapters/out/memoria/repositorio-produto-em-memoria.js';
import { RepositorioUsuarioEmMemoria } from '../../src/adapters/out/memoria/repositorio-usuario-em-memoria.js';
import { RelogioFixo } from '../../src/adapters/out/sistema/relogio-fixo.js';
import { GeradorIdSequencial } from '../../src/adapters/out/sistema/gerador-id-sequencial.js';
import { GeradorHashSenhaFalso, EmissorTokenFalso, GatewayPagamentoDuble } from './falsos.js';
import { montarPropsProduto } from './montadores.js';

export const EMAIL_ADMINISTRADOR = 'admin@example.com';

export const INICIO_RELOGIO = new Date('2026-11-06T12:00:00Z');

function montarRepositorios() {
  return {
    repositorioProduto: new RepositorioProdutoEmMemoria(),
    repositorioUsuario: new RepositorioUsuarioEmMemoria(),
    repositorioCarrinho: new RepositorioCarrinhoEmMemoria(),
    repositorioCupom: new RepositorioCupomEmMemoria(),
    repositorioPedido: new RepositorioPedidoEmMemoria(),
  };
}

function montarServicos() {
  return {
    geradorHashSenha: new GeradorHashSenhaFalso(),
    emissorToken: new EmissorTokenFalso(),
    gatewayPagamento: new GatewayPagamentoDuble(),
    clock: new RelogioFixo(INICIO_RELOGIO),
    geradorId: new GeradorIdSequencial('id'),
  };
}

function montarCasosDeUsoCarrinho(dependencies) {
  const obterCarrinho = new ObterCarrinho(dependencies);
  return {
    obterCarrinho,
    adicionarItemAoCarrinho: new AdicionarItemAoCarrinho({ ...dependencies, obterCarrinho }),
    atualizarItemDoCarrinho: new AtualizarItemDoCarrinho({ ...dependencies, obterCarrinho }),
    removerItemDoCarrinho: new RemoverItemDoCarrinho({ ...dependencies, obterCarrinho }),
  };
}

export function montarAmbiente() {
  const dependencies = { ...montarRepositorios(), ...montarServicos() };
  const cotarPedido = new CotarPedido(dependencies);
  const emailsAdministradores = [EMAIL_ADMINISTRADOR];
  return {
    ...dependencies,
    ...montarCasosDeUsoCarrinho(dependencies),
    cotarPedido,
    listarProdutos: new ListarProdutos(dependencies),
    obterProduto: new ObterProduto(dependencies),
    cadastrarProduto: new CadastrarProduto({ ...dependencies, emailsAdministradores }),
    alterarProduto: new AlterarProduto({ ...dependencies, emailsAdministradores }),
    cadastrarUsuario: new CadastrarUsuario(dependencies),
    autenticarUsuario: new AutenticarUsuario({ ...dependencies, emailsAdministradores }),
    verificarSessao: new VerificarSessao(dependencies),
    excluirConta: new ExcluirConta(dependencies),
    obterPedidos: new ObterPedidos(dependencies),
    finalizarPedido: new FinalizarPedido({ ...dependencies, cotarPedido }),
  };
}

export async function dadoProduto(ambiente, sobrescritas = {}) {
  const produto = criarProduto(montarPropsProduto(sobrescritas));
  await ambiente.repositorioProduto.salvar(produto);
  return produto;
}

export async function dadoCupom(ambiente, propriedades) {
  const cupom = criarCupom(propriedades);
  await ambiente.repositorioCupom.salvar(cupom);
  return cupom;
}
