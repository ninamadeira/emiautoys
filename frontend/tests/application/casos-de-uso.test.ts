import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ErroDaAplicacao } from '../../src/app/application/domain/erro-da-aplicacao';
import { AdicionarAoCarrinho } from '../../src/app/application/use-cases/adicionar-ao-carrinho';
import { ConsultarCatalogo } from '../../src/app/application/use-cases/consultar-catalogo';
import { AlterarQuantidadeItemCarrinho } from '../../src/app/application/use-cases/alterar-quantidade-item-carrinho';
import { ExcluirConta } from '../../src/app/application/use-cases/excluir-conta';
import { ObterDetalhesProduto } from '../../src/app/application/use-cases/obter-detalhes-produto';
import { RealizarPedido } from '../../src/app/application/use-cases/realizar-pedido';
import { CotarPedido } from '../../src/app/application/use-cases/cotar-pedido';
import { CadastrarConta } from '../../src/app/application/use-cases/cadastrar-conta';
import { RemoverDoCarrinho } from '../../src/app/application/use-cases/remover-do-carrinho';
import { RestaurarSessao } from '../../src/app/application/use-cases/restaurar-sessao';
import { Entrar } from '../../src/app/application/use-cases/entrar';
import { Sair } from '../../src/app/application/use-cases/sair';
import {
  GatewayContaFalso,
  GatewayAutenticacaoFalso,
  GatewayCarrinhoFalso,
  GatewayFinalizacaoFalso,
  GatewayProdutoFalso,
  ArmazenamentoSessaoFalso,
  PRODUTO,
  USUARIO,
} from './falsos';

const ENDERECO_VALIDO = {
  nomeDestinatario: 'Maria Silva',
  cep: '90010-000',
  rua: 'Rua dos Andradas',
  numero: '100',
  complemento: '',
  cidade: 'Porto Alegre',
  estado: 'RS',
};

async function codigoDe(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (erro) {
    assert.ok(erro instanceof ErroDaAplicacao);
    return erro.codigo;
  }
  throw new Error('era esperado que a promise fosse rejeitada');
}

describe('casos de uso do catálogo', () => {
  it('consulta todos os produtos ou uma categoria', async () => {
    const gateway = new GatewayProdutoFalso();
    const browse = new ConsultarCatalogo(gateway);
    assert.deepEqual(await browse.executar(), [PRODUTO]);
    await browse.executar('BOLINHA');
    assert.equal(gateway.ultimaCategoria, 'BOLINHA');
  });

  it('obtém os detalhes do produto e propaga o não encontrado', async () => {
    const detalhes = new ObterDetalhesProduto(new GatewayProdutoFalso());
    assert.equal((await detalhes.executar('p1')).id, 'p1');
    assert.equal(await codigoDe(detalhes.executar('fantasma')), 'PRODUTO_NAO_ENCONTRADO');
  });
});

describe('casos de uso da sessão', () => {
  it('entra e persiste a sessão', async () => {
    const storage = new ArmazenamentoSessaoFalso();
    const usuario = await new Entrar(new GatewayAutenticacaoFalso(), storage).executar({ email: 'maria@example.com', senha: 'miau1234' });
    assert.deepEqual(usuario, USUARIO);
    assert.equal(storage.atual?.token, 'token-1');
  });

  it('não persiste nada quando a entrada falha', async () => {
    const storage = new ArmazenamentoSessaoFalso();
    const entrar = new Entrar(new GatewayAutenticacaoFalso(), storage);
    assert.equal(await codigoDe(entrar.executar({ email: 'maria@example.com', senha: 'wrong1234' })), 'CREDENCIAIS_INVALIDAS');
    assert.equal(storage.atual, undefined);
  });

  it('valida o e-mail antes de chamar o servidor', async () => {
    const entrar = new Entrar(new GatewayAutenticacaoFalso(), new ArmazenamentoSessaoFalso());
    assert.equal(await codigoDe(entrar.executar({ email: 'invalido', senha: 'miau1234' })), 'VALIDACAO_FALHOU');
  });

  it('restaura e limpa a sessão', () => {
    const storage = new ArmazenamentoSessaoFalso();
    assert.equal(new RestaurarSessao(storage).executar(), undefined);
    storage.salvar({ token: 't', usuario: USUARIO });
    assert.equal(new RestaurarSessao(storage).executar()?.usuario.id, 'u1');
    new Sair(storage).executar();
    assert.equal(storage.atual, undefined);
  });

  it('cadastra uma conta somente com senha forte', async () => {
    const gateway = new GatewayAutenticacaoFalso();
    const cadastrar = new CadastrarConta(gateway);
    assert.equal(await codigoDe(cadastrar.executar({ nome: 'Maria', email: 'maria@example.com', senha: 'fraca' })), 'VALIDACAO_FALHOU');
    assert.equal(gateway.cadastros.length, 0);
    await cadastrar.executar({ nome: 'Maria', email: 'maria@example.com', senha: 'miau1234' });
    assert.equal(gateway.cadastros.length, 1);
  });

  it('exclui a conta e limpa a sessão local', async () => {
    const gatewayConta = new GatewayContaFalso();
    const storage = new ArmazenamentoSessaoFalso();
    storage.salvar({ token: 't', usuario: USUARIO });
    await new ExcluirConta(gatewayConta, storage).executar();
    assert.equal(gatewayConta.deleted, true);
    assert.equal(storage.atual, undefined);
  });
});

describe('casos de uso do carrinho', () => {
  it('delega adicionar, alterar e remover ao gateway', async () => {
    const gateway = new GatewayCarrinhoFalso();
    await new AdicionarAoCarrinho(gateway).executar('p1', 2);
    await new AlterarQuantidadeItemCarrinho(gateway).executar('p1', 3);
    await new RemoverDoCarrinho(gateway).executar('p1');
    assert.deepEqual(gateway.calls, ['add:p1:2', 'update:p1:3', 'remove:p1']);
  });

  it('rejeita quantidades inválidas sem chamar o servidor', async () => {
    const gateway = new GatewayCarrinhoFalso();
    assert.equal(await codigoDe(new AdicionarAoCarrinho(gateway).executar('p1', 0)), 'VALIDACAO_FALHOU');
    assert.equal(await codigoDe(new AlterarQuantidadeItemCarrinho(gateway).executar('p1', 1.5)), 'VALIDACAO_FALHOU');
    assert.deepEqual(gateway.calls, []);
  });
});

describe('casos de uso da finalização', () => {
  it('cota com CEP normalizado e cupom sem espaços nas pontas', async () => {
    const gateway = new GatewayFinalizacaoFalso();
    await new CotarPedido(gateway).executar({ cep: '90010-000', codigoCupom: ' miau10 ' });
    assert.deepEqual(gateway.requisicoesCotacao[0], { cep: '90010000', codigoCupom: 'miau10' });
  });

  it('rejeita CEP inválido sem chamar o servidor', async () => {
    const gateway = new GatewayFinalizacaoFalso();
    assert.equal(await codigoDe(new CotarPedido(gateway).executar({ cep: '123' })), 'VALIDACAO_FALHOU');
    assert.equal(gateway.requisicoesCotacao.length, 0);
  });

  it('realiza o pedido com token de cartão simulado e nunca envia dados do cartão', async () => {
    const gateway = new GatewayFinalizacaoFalso();
    await new RealizarPedido(gateway).executar({ enderecoEntrega: ENDERECO_VALIDO, meioPagamento: 'CARTAO' });
    const enviado = gateway.requisicoesPedido[0];
    assert.equal(enviado.tokenPagamento, 'tok_simulado');
    assert.equal(enviado.enderecoEntrega.cep, '90010000');
  });

  it('não envia token para PIX', async () => {
    const gateway = new GatewayFinalizacaoFalso();
    await new RealizarPedido(gateway).executar({ enderecoEntrega: ENDERECO_VALIDO, meioPagamento: 'PIX' });
    assert.equal(gateway.requisicoesPedido[0].tokenPagamento, undefined);
  });

  it('rejeita endereços incompletos', async () => {
    const gateway = new GatewayFinalizacaoFalso();
    const incompleto = { ...ENDERECO_VALIDO, rua: ' ' };
    assert.equal(await codigoDe(new RealizarPedido(gateway).executar({ enderecoEntrega: incompleto, meioPagamento: 'PIX' })), 'VALIDACAO_FALHOU');
    assert.equal(gateway.requisicoesPedido.length, 0);
  });
});
