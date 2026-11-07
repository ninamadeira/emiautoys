import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularDescontoCentavos,
  criarCupom,
  normalizarCodigoCupom,
} from '../../../src/application/domain/cupom.js';
import { ErroCupomInvalido, ErroValidacao } from '../../../src/application/domain/erros.js';

const AGORA = new Date('2026-11-06T12:00:00Z');

describe('cupom', () => {
  it('normaliza o código para maiúsculas e sem espaços', () => {
    assert.equal(normalizarCodigoCupom('  miau10 '), 'MIAU10');
    assert.equal(criarCupom({ codigo: 'miau10', percentualDesconto: 10 }).codigo, 'MIAU10');
  });

  it('calcula o desconto percentual arredondado para baixo em centavos', () => {
    const cupom = criarCupom({ codigo: 'MIAU10', percentualDesconto: 10 });
    assert.equal(calcularDescontoCentavos({ cupom, subtotalCentavos: 1999, agora: AGORA }), 199);
  });

  it('rejeita descontos fora da faixa permitida', () => {
    assert.throws(() => criarCupom({ codigo: 'X', percentualDesconto: 0 }), ErroValidacao);
    assert.throws(() => criarCupom({ codigo: 'X', percentualDesconto: 51 }), ErroValidacao);
  });

  it('rejeita cupons expirados', () => {
    const cupom = criarCupom({ codigo: 'OLD', percentualDesconto: 5, expiraEm: new Date('2026-01-01T00:00:00Z') });
    assert.throws(() => calcularDescontoCentavos({ cupom, subtotalCentavos: 1000, agora: AGORA }), ErroCupomInvalido);
  });

  it('rejeita cupons inativos', () => {
    const cupom = criarCupom({ codigo: 'OFF', percentualDesconto: 5, ativo: false });
    assert.throws(() => calcularDescontoCentavos({ cupom, subtotalCentavos: 1000, agora: AGORA }), ErroCupomInvalido);
  });
});
