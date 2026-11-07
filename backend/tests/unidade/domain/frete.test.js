import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIMITE_FRETE_GRATIS_CENTAVOS,
  calcularCustoFrete,
  normalizarCep,
} from '../../../src/application/domain/frete.js';
import { ErroValidacao } from '../../../src/application/domain/erros.js';

describe('frete', () => {
  it('normaliza CEPs para oito dígitos', () => {
    assert.equal(normalizarCep('90010-000'), '90010000');
  });

  it('rejeita CEPs malformados', () => {
    assert.throws(() => normalizarCep('123'), ErroValidacao);
    assert.throws(() => normalizarCep('abcdefgh'), ErroValidacao);
  });

  it('cobra tarifa regional abaixo do limite de frete grátis', () => {
    const south = calcularCustoFrete({ subtotalCentavos: 5000, cep: '90010-000' });
    const north = calcularCustoFrete({ subtotalCentavos: 5000, cep: '69000-000' });
    assert.ok(south > 0);
    assert.ok(north > south);
  });

  it('é grátis no limite ou acima dele', () => {
    const cost = calcularCustoFrete({ subtotalCentavos: LIMITE_FRETE_GRATIS_CENTAVOS, cep: '69000-000' });
    assert.equal(cost, 0);
  });
});
