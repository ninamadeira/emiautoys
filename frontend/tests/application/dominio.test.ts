import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { senhaEhForte, emailEhValido, normalizarCep } from '../../src/app/application/domain/validacao';

describe('validação no cliente', () => {
  it('valida e-mails', () => {
    assert.equal(emailEhValido('maria@example.com'), true);
    assert.equal(emailEhValido('maria@'), false);
  });

  it('valida a força da senha como o servidor', () => {
    assert.equal(senhaEhForte('miau1234'), true);
    for (const fraca of ['short1', 'onlyletters', '12345678']) assert.equal(senhaEhForte(fraca), false);
  });

  it('normaliza CEPs e devolve undefined para os inválidos', () => {
    assert.equal(normalizarCep('90010-000'), '90010000');
    assert.equal(normalizarCep('9001'), undefined);
  });
});
