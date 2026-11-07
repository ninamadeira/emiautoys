import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { carregarConfiguracao } from '../../src/config/ambiente.js';

describe('carregarConfiguracao', () => {
  it('usa padrões seguros de desenvolvimento e gera um segredo de token aleatório', () => {
    const first = carregarConfiguracao({});
    const second = carregarConfiguracao({});
    assert.equal(first.porta, 3000);
    assert.equal(first.carregarCatalogoInicial, true);
    assert.ok(first.segredoToken.length >= 32);
    assert.notEqual(first.segredoToken, second.segredoToken);
  });

  it('exige SEGREDO_TOKEN em produção e não carrega dados iniciais por padrão', () => {
    assert.throws(() => carregarConfiguracao({ NODE_ENV: 'production' }), /SEGREDO_TOKEN/);
    const configuracao = carregarConfiguracao({ NODE_ENV: 'production', SEGREDO_TOKEN: 'x'.repeat(40) });
    assert.equal(configuracao.carregarCatalogoInicial, false);
  });

  it('lê substituições a partir do ambiente', () => {
    const configuracao = carregarConfiguracao({ PORT: '8080', ARQUIVO_BANCO: 'a.sqlite', ORIGEM_CORS: 'https://emiautoys.example', CARREGAR_CATALOGO_INICIAL: 'true', SEGREDO_TOKEN: 'y'.repeat(40) });
    assert.equal(configuracao.porta, 8080);
    assert.equal(configuracao.arquivoBanco, 'a.sqlite');
    assert.equal(configuracao.origemCors, 'https://emiautoys.example');
  });
});
