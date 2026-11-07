import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RegistradorSilencioso } from '../../src/adapters/out/sistema/registrador-silencioso.js';
import { montarAplicacao } from '../../src/config/raiz-de-composicao.js';
import { SENHA_VALIDA, montarPropsEnderecoEntrega } from '../suporte/montadores.js';

const CONFIG_TESTE = Object.freeze({
  porta: 0,
  arquivoBanco: ':memory:',
  segredoToken: 'e2e-secret-with-enough-length-0123456789',
  ttlTokenSegundos: 3600,
  origemCors: 'http://localhost:4200',
  carregarCatalogoInicial: true,
});

let aplicacao;
let urlBase;

async function requisicao(path, { method = 'GET', token, body, corpoBruto } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  const resposta = await fetch(`${urlBase}${path}`, {
    method,
    headers,
    body: corpoBruto ?? (body ? JSON.stringify(body) : undefined),
  });
  const texto = await resposta.text();
  return { status: resposta.status, headers: resposta.headers, json: texto ? JSON.parse(texto) : undefined };
}

async function cadastrarEEntrar(email) {
  const credenciais = { email, senha: SENHA_VALIDA };
  const cadastro = await requisicao('/api/autenticacao/cadastrar', { method: 'POST', body: { nome: 'Maria', ...credenciais } });
  assert.equal(cadastro.status, 201);
  const entrar = await requisicao('/api/autenticacao/entrar', { method: 'POST', body: credenciais });
  assert.equal(entrar.status, 200);
  return entrar.json.token;
}

before(async () => {
  aplicacao = await montarAplicacao(CONFIG_TESTE, { logger: new RegistradorSilencioso() });
  await aplicacao.listen();
  urlBase = `http://127.0.0.1:${aplicacao.porta()}`;
});

after(async () => {
  await aplicacao.close();
});

describe('Jornada P1: navegar, cadastrar e comprar', () => {
  it('permite ao cliente navegar, adicionar ao carrinho, cotar com cupom, pagar e ver o pedido', async () => {
    const catalogo = await requisicao('/api/produtos');
    assert.equal(catalogo.status, 200);
    const produto = catalogo.json.produtos[0];
    assert.ok(produto.avisoSeguranca, 'todo produto exibe um aviso de segurança');
    assert.ok(produto.faixaEtariaIndicada, 'todo produto exibe a idade recomendada');

    const token = await cadastrarEEntrar('journey@example.com');
    const added = await requisicao('/api/carrinho/itens', { method: 'POST', token, body: { produtoId: produto.id, quantidade: 2 } });
    assert.equal(added.status, 200);
    assert.equal(added.json.totalUnidades, 2);

    const cotacao = await requisicao('/api/finalizacao/cotacao', { method: 'POST', token, body: { cep: '90010-000', codigoCupom: 'miau10' } });
    assert.equal(cotacao.status, 200);
    assert.ok(cotacao.json.descontoCentavos > 0);

    const finalizacao = await requisicao('/api/finalizacao', {
      method: 'POST',
      token,
      body: { enderecoEntrega: montarPropsEnderecoEntrega(), codigoCupom: 'MIAU10', meioPagamento: 'PIX' },
    });
    assert.equal(finalizacao.status, 201);
    assert.equal(finalizacao.json.pedido.totalCentavos, cotacao.json.totalCentavos);

    const pedidos = await requisicao('/api/pedidos', { token });
    assert.equal(pedidos.json.pedidos.length, 1);
    const aposCompra = await requisicao(`/api/produtos/${produto.id}`);
    assert.equal(aposCompra.json.produto.estoque, produto.estoque - 2);
    const carrinho = await requisicao('/api/carrinho', { token });
    assert.equal(carrinho.json.totalUnidades, 0);
  });

  it('mantém o carrinho e o estoque quando o cartão é recusado', async () => {
    const token = await cadastrarEEntrar('declined@example.com');
    const produto = (await requisicao('/api/produtos')).json.produtos[1];
    await requisicao('/api/carrinho/itens', { method: 'POST', token, body: { produtoId: produto.id, quantidade: 1 } });
    const finalizacao = await requisicao('/api/finalizacao', {
      method: 'POST',
      token,
      body: { enderecoEntrega: montarPropsEnderecoEntrega(), meioPagamento: 'CARTAO', tokenPagamento: 'tok_recusado' },
    });
    assert.equal(finalizacao.status, 402);
    assert.equal(finalizacao.json.erro.codigo, 'PAGAMENTO_RECUSADO');
    assert.equal((await requisicao(`/api/produtos/${produto.id}`)).json.produto.estoque, produto.estoque);
    assert.equal((await requisicao('/api/carrinho', { token })).json.totalUnidades, 1);
  });

  it('apaga a conta sob solicitação (LGPD)', async () => {
    const token = await cadastrarEEntrar('erase@example.com');
    assert.equal((await requisicao('/api/conta', { method: 'DELETE', token })).status, 204);
    assert.equal((await requisicao('/api/carrinho', { token })).status, 401);
    const entrar = await requisicao('/api/autenticacao/entrar', { method: 'POST', body: { email: 'erase@example.com', senha: SENHA_VALIDA } });
    assert.equal(entrar.status, 401);
  });
});

describe('Comportamento da API: erros, tradução e segurança', () => {
  it('filtra o catálogo por categoria e rejeita categorias desconhecidas em pt-BR', async () => {
    const wands = await requisicao('/api/produtos?categoria=VARINHA');
    assert.ok(wands.json.produtos.every((produto) => produto.categoria === 'VARINHA'));
    const invalido = await requisicao('/api/produtos?categoria=CACHORRO');
    assert.equal(invalido.status, 400);
    assert.equal(invalido.json.erro.codigo, 'VALIDACAO_FALHOU');
  });

  it('responde 404 para produto desconhecido com mensagem em português', async () => {
    const resposta = await requisicao('/api/produtos/fantasma');
    assert.equal(resposta.status, 404);
    assert.equal(resposta.json.erro.codigo, 'PRODUTO_NAO_ENCONTRADO');
    assert.match(resposta.json.erro.mensagem, /Produto não encontrado/);
  });

  it('exige autenticação para o carrinho', async () => {
    const resposta = await requisicao('/api/carrinho');
    assert.equal(resposta.status, 401);
    assert.equal(resposta.json.erro.codigo, 'NAO_AUTORIZADO');
  });

  it('valida a entrada no servidor: senha fraca, e-mail duplicado, credenciais inválidas', async () => {
    const fraca = await requisicao('/api/autenticacao/cadastrar', { method: 'POST', body: { nome: 'A', email: 'a@example.com', senha: 'fraca' } });
    assert.equal(fraca.status, 400);
    await cadastrarEEntrar('dup@example.com');
    const duplicado = await requisicao('/api/autenticacao/cadastrar', { method: 'POST', body: { nome: 'A', email: 'dup@example.com', senha: SENHA_VALIDA } });
    assert.equal(duplicado.status, 409);
    const incorreta = await requisicao('/api/autenticacao/entrar', { method: 'POST', body: { email: 'dup@example.com', senha: 'nope12345' } });
    assert.equal(incorreta.status, 401);
    assert.equal(incorreta.json.erro.codigo, 'CREDENCIAIS_INVALIDAS');
  });

  it('recusa exceder o estoque ao adicionar ao carrinho', async () => {
    const token = await cadastrarEEntrar('estoque@example.com');
    const produto = (await requisicao('/api/produtos')).json.produtos[2];
    const resposta = await requisicao('/api/carrinho/itens', { method: 'POST', token, body: { produtoId: produto.id, quantidade: 10 } });
    assert.equal(resposta.status, 200);
    const excesso = await requisicao('/api/carrinho/itens', { method: 'POST', token, body: { produtoId: produto.id, quantidade: 11 } });
    assert.equal(excesso.status, 400);
  });

  it('rejeita cupom inválido e carrinho vazio', async () => {
    const token = await cadastrarEEntrar('cupom@example.com');
    const empty = await requisicao('/api/finalizacao/cotacao', { method: 'POST', token, body: { cep: '90010-000' } });
    assert.equal(empty.status, 422);
    const produto = (await requisicao('/api/produtos')).json.produtos[0];
    await requisicao('/api/carrinho/itens', { method: 'POST', token, body: { produtoId: produto.id, quantidade: 1 } });
    const invalido = await requisicao('/api/finalizacao/cotacao', { method: 'POST', token, body: { cep: '90010-000', codigoCupom: 'INEXISTENTE' } });
    assert.equal(invalido.status, 422);
    assert.equal(invalido.json.erro.codigo, 'CUPOM_INVALIDO');
  });

  it('atualiza e remove itens do carrinho', async () => {
    const token = await cadastrarEEntrar('update@example.com');
    const produto = (await requisicao('/api/produtos')).json.produtos[0];
    await requisicao('/api/carrinho/itens', { method: 'POST', token, body: { produtoId: produto.id, quantidade: 1 } });
    const updated = await requisicao(`/api/carrinho/itens/${produto.id}`, { method: 'PUT', token, body: { quantidade: 3 } });
    assert.equal(updated.json.totalUnidades, 3);
    const removed = await requisicao(`/api/carrinho/itens/${produto.id}`, { method: 'DELETE', token });
    assert.equal(removed.json.totalUnidades, 0);
  });

  it('envia cabeçalhos de segurança e CORS somente para a origem configurada', async () => {
    const resposta = await requisicao('/api/saude');
    assert.equal(resposta.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(resposta.headers.get('access-control-allow-origin'), 'http://localhost:4200');
    assert.equal(resposta.headers.get('x-powered-by'), null);
  });

  it('responde 400 a JSON malformado e 404 a rotas desconhecidas', async () => {
    const malformado = await requisicao('/api/autenticacao/entrar', { method: 'POST', corpoBruto: '{not json' });
    assert.equal(malformado.status, 400);
    assert.equal(malformado.json.erro.codigo, 'JSON_INVALIDO');
    assert.equal((await requisicao('/api/nope')).status, 404);
    assert.equal((await requisicao('/api/produtos', { method: 'DELETE' })).status, 405);
  });

  it('rejeita corpos grandes demais', async () => {
    const huge = JSON.stringify({ nome: 'x'.repeat(200_000) });
    const resposta = await requisicao('/api/autenticacao/cadastrar', { method: 'POST', corpoBruto: huge });
    assert.equal(resposta.status, 413);
  });

  it('responde às requisições preflight de CORS', async () => {
    const resposta = await fetch(`${urlBase}/api/carrinho`, { method: 'OPTIONS' });
    assert.equal(resposta.status, 204);
  });
});
