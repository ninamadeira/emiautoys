import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RegistradorSilencioso } from '../../src/adapters/out/sistema/registrador-silencioso.js';
import { montarAplicacao } from '../../src/config/raiz-de-composicao.js';
import { SENHA_VALIDA } from '../suporte/montadores.js';

const EMAIL_ADMIN = 'admin@example.com';

const CONFIG_TESTE = Object.freeze({
  porta: 0,
  arquivoBanco: ':memory:',
  segredoToken: 'e2e-secret-with-enough-length-0123456789',
  ttlTokenSegundos: 3600,
  origemCors: 'http://localhost:4200',
  carregarCatalogoInicial: true,
  emailsAdministradores: [EMAIL_ADMIN],
});

const NOVO_PRODUTO = Object.freeze({
  nome: 'Rato de crochê',
  descricao: 'Rato feito à mão com lã atóxica.',
  categoria: 'BOLINHA',
  precoCentavos: 1890,
  estoque: 12,
  faixaEtariaIndicada: 'ADULTO',
  avisoSeguranca: 'Use com supervisão.',
  urlImagem: '/imagens/rato-croche.webp',
});

let aplicacao;
let urlBase;

async function requisicao(path, { method = 'GET', token, body } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  const resposta = await fetch(`${urlBase}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const texto = await resposta.text();
  return { status: resposta.status, json: texto ? JSON.parse(texto) : undefined };
}

async function cadastrarEEntrar(email) {
  const credenciais = { email, senha: SENHA_VALIDA };
  await requisicao('/api/autenticacao/cadastrar', { method: 'POST', body: { nome: 'Pessoa', ...credenciais } });
  return (await requisicao('/api/autenticacao/entrar', { method: 'POST', body: credenciais })).json.token;
}

before(async () => {
  aplicacao = await montarAplicacao(CONFIG_TESTE, { logger: new RegistradorSilencioso() });
  await aplicacao.listen();
  urlBase = `http://127.0.0.1:${aplicacao.porta()}`;
});

after(async () => {
  await aplicacao.close();
});

describe('Gestão de produtos pelo administrador', () => {
  it('exige login para cadastrar e alterar produtos', async () => {
    assert.equal((await requisicao('/api/produtos', { method: 'POST', body: NOVO_PRODUTO })).status, 401);
    assert.equal((await requisicao('/api/produtos/varinha-pena', { method: 'PUT', body: { precoCentavos: 1 } })).status, 401);
  });

  it('nega a clientes comuns com 403 e não altera o preço', async () => {
    const token = await cadastrarEEntrar('cliente@example.com');
    assert.equal((await requisicao('/api/produtos', { method: 'POST', token, body: NOVO_PRODUTO })).status, 403);
    const alteracao = await requisicao('/api/produtos/varinha-pena', { method: 'PUT', token, body: { precoCentavos: 1 } });
    assert.equal(alteracao.status, 403);
    assert.equal((await requisicao('/api/produtos/varinha-pena')).json.produto.precoCentavos, 2990);
  });

  it('permite ao administrador cadastrar um produto e alterar seu preço', async () => {
    const token = await cadastrarEEntrar(EMAIL_ADMIN);
    const cadastro = await requisicao('/api/produtos', { method: 'POST', token, body: NOVO_PRODUTO });
    assert.equal(cadastro.status, 201);
    const { id } = cadastro.json.produto;
    const alteracao = await requisicao(`/api/produtos/${id}`, { method: 'PUT', token, body: { precoCentavos: 2190 } });
    assert.equal(alteracao.status, 200);
    assert.equal((await requisicao(`/api/produtos/${id}`)).json.produto.precoCentavos, 2190);
  });

  it('rejeita preço inválido com 400', async () => {
    const token = await cadastrarEEntrar(EMAIL_ADMIN);
    const resposta = await requisicao('/api/produtos/varinha-pena', { method: 'PUT', token, body: { precoCentavos: -5 } });
    assert.equal(resposta.status, 400);
  });
});
