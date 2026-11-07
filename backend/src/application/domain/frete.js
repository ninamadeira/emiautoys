import { ErroValidacao } from './erros.js';

export const LIMITE_FRETE_GRATIS_CENTAVOS = 15000;

const TAMANHO_CEP = 8;

const TARIFA_FRETE_CENTAVOS_POR_DIGITO_REGIAO = Object.freeze({
  0: 1990,
  1: 1990,
  2: 1990,
  3: 1990,
  4: 2490,
  5: 2490,
  6: 2990,
  7: 2290,
  8: 1490,
  9: 1290,
});

export function normalizarCep(cep) {
  const digits = String(cep ?? '').replace(/\D/g, '');
  if (digits.length !== TAMANHO_CEP) {
    throw new ErroValidacao('cep', 'FORMATO_INVALIDO');
  }
  return digits;
}

export function calcularCustoFrete({ subtotalCentavos, cep }) {
  const digitoRegiao = normalizarCep(cep)[0];
  if (subtotalCentavos >= LIMITE_FRETE_GRATIS_CENTAVOS) {
    return 0;
  }
  return TARIFA_FRETE_CENTAVOS_POR_DIGITO_REGIAO[digitoRegiao];
}
