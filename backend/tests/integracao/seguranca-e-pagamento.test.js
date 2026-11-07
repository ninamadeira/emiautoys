import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErroNaoAutorizado } from '../../src/application/domain/erros.js';
import { garantirQueImplementaPorta } from '../../src/application/ports/definir-porta.js';
import { GeradorHashSenha } from '../../src/application/ports/out/gerador-hash-senha.js';
import { GatewayPagamento } from '../../src/application/ports/out/gateway-pagamento.js';
import { EmissorToken } from '../../src/application/ports/out/emissor-token.js';
import { GatewayPagamentoSimulado, TOKEN_RECUSADO } from '../../src/adapters/out/pagamento/gateway-pagamento-simulado.js';
import { EmissorTokenHmac } from '../../src/adapters/out/seguranca/emissor-token-hmac.js';
import { GeradorHashSenhaScrypt } from '../../src/adapters/out/seguranca/gerador-hash-senha-scrypt.js';
import { RelogioFixo } from '../../src/adapters/out/sistema/relogio-fixo.js';

const SECRET = 'test-secret-with-enough-length-0123456789';
const START = new Date('2026-11-06T12:00:00Z');

describe('GeradorHashSenhaScrypt', () => {
  const gerador = new GeradorHashSenhaScrypt();

  it('implementa a porta', () => garantirQueImplementaPorta(GeradorHashSenha, gerador));

  it('nunca guarda a senha em texto puro e usa sal em cada hash', async () => {
    const first = await gerador.hash('miau1234');
    const second = await gerador.hash('miau1234');
    assert.ok(!first.includes('miau1234'));
    assert.notEqual(first, second);
  });

  it('verifica a senha correta e rejeita a errada', async () => {
    const hashSenha = await gerador.hash('miau1234');
    assert.equal(await gerador.verificar({ senhaEmTextoPuro: 'miau1234', hashSenha }), true);
    assert.equal(await gerador.verificar({ senhaEmTextoPuro: 'miau12345', hashSenha }), false);
  });

  it('rejeita hash armazenado malformado em vez de lançar erro', async () => {
    assert.equal(await gerador.verificar({ senhaEmTextoPuro: 'x', hashSenha: 'garbage' }), false);
  });
});

describe('EmissorTokenHmac', () => {
  it('implementa a porta', () => {
    garantirQueImplementaPorta(EmissorToken, new EmissorTokenHmac({ segredo: SECRET, clock: new RelogioFixo(START), ttlSegundos: 60 }));
  });

  it('emite um token que é verificado de volta para o id do usuário', () => {
    const emissor = new EmissorTokenHmac({ segredo: SECRET, clock: new RelogioFixo(START), ttlSegundos: 60 });
    assert.equal(emissor.verificar(emissor.emitir('user-1')).usuarioId, 'user-1');
  });

  it('rejeita tokens expirados', () => {
    const clock = new RelogioFixo(START);
    const emissor = new EmissorTokenHmac({ segredo: SECRET, clock, ttlSegundos: 60 });
    const token = emissor.emitir('user-1');
    clock.avancarSegundos(61);
    assert.throws(() => emissor.verificar(token), ErroNaoAutorizado);
  });

  it('rejeita tokens adulterados e assinados com outro segredo', () => {
    const clock = new RelogioFixo(START);
    const emissor = new EmissorTokenHmac({ segredo: SECRET, clock, ttlSegundos: 60 });
    const outro = new EmissorTokenHmac({ segredo: `${SECRET}-other`, clock, ttlSegundos: 60 });
    const [carga, assinatura] = emissor.emitir('user-1').split('.');
    const cargaForjada = Buffer.from(JSON.stringify({ sub: 'admin', exp: 9999999999 })).toString('base64url');
    assert.throws(() => emissor.verificar(`${cargaForjada}.${assinatura}`), ErroNaoAutorizado);
    assert.throws(() => emissor.verificar(outro.emitir('user-1')), ErroNaoAutorizado);
    assert.throws(() => emissor.verificar(`${carga}`), ErroNaoAutorizado);
    assert.throws(() => emissor.verificar(undefined), ErroNaoAutorizado);
  });

  it('recusa iniciar com segredo curto', () => {
    assert.throws(() => new EmissorTokenHmac({ segredo: 'short', clock: new RelogioFixo(START), ttlSegundos: 60 }), TypeError);
  });
});

describe('GatewayPagamentoSimulado', () => {
  const gateway = new GatewayPagamentoSimulado();

  it('implementa a porta', () => garantirQueImplementaPorta(GatewayPagamento, gateway));

  it('aprova PIX, BOLETO e cartão com token', async () => {
    for (const requisicao of [{ method: 'PIX' }, { method: 'BOLETO' }, { method: 'CARTAO', token: 'tok_ok' }]) {
      const resultado = await gateway.cobrar({ pedidoId: 'o1', valorCentavos: 1000, ...requisicao });
      assert.equal(resultado.aprovado, true);
      assert.match(resultado.transacaoId, /^sim-o1-/);
    }
  });

  it('recusa cartão sem token ou com o token recusado', async () => {
    assert.equal((await gateway.cobrar({ pedidoId: 'o1', method: 'CARTAO' })).aprovado, false);
    assert.equal((await gateway.cobrar({ pedidoId: 'o1', method: 'CARTAO', token: TOKEN_RECUSADO })).aprovado, false);
  });
});
