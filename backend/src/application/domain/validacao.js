import { ErroValidacao } from './erros.js';

export function exigirTexto(value, campo) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ErroValidacao(campo, 'OBRIGATORIO');
  }
  return value.trim();
}

export function exigirUmDe(value, valoresPermitidos, campo) {
  if (!valoresPermitidos.includes(value)) {
    throw new ErroValidacao(campo, 'NAO_PERMITIDO');
  }
  return value;
}

export function exigirInteiroNaoNegativo(value, campo) {
  if (!Number.isInteger(value) || value < 0) {
    throw new ErroValidacao(campo, 'INTEIRO_NAO_NEGATIVO_OBRIGATORIO');
  }
  return value;
}

export function exigirInteiroPositivo(value, campo) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ErroValidacao(campo, 'INTEIRO_POSITIVO_OBRIGATORIO');
  }
  return value;
}
