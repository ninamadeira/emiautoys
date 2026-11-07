import { ErroCupomInvalido, ErroValidacao } from './erros.js';
import { exigirTexto } from './validacao.js';

export const PERCENTUAL_MAXIMO_DESCONTO = 50;

export function normalizarCodigoCupom(codigo) {
  return exigirTexto(codigo, 'codigoCupom').toUpperCase();
}

function exigirPercentualDesconto(percentualDesconto) {
  const estaNoIntervalo = Number.isInteger(percentualDesconto) && percentualDesconto >= 1 && percentualDesconto <= PERCENTUAL_MAXIMO_DESCONTO;
  if (!estaNoIntervalo) {
    throw new ErroValidacao('percentualDesconto', 'FORA_DO_INTERVALO');
  }
  return percentualDesconto;
}

export function criarCupom({ codigo, percentualDesconto, expiraEm, ativo = true }) {
  return Object.freeze({
    codigo: normalizarCodigoCupom(codigo),
    percentualDesconto: exigirPercentualDesconto(percentualDesconto),
    expiraEm,
    ativo,
  });
}

function garantirUtilizavel(cupom, agora) {
  if (!cupom.ativo) {
    throw new ErroCupomInvalido('INATIVO');
  }
  if (cupom.expiraEm && cupom.expiraEm <= agora) {
    throw new ErroCupomInvalido('EXPIRADO');
  }
}

export function calcularDescontoCentavos({ cupom, subtotalCentavos, agora }) {
  garantirUtilizavel(cupom, agora);
  return Math.floor((subtotalCentavos * cupom.percentualDesconto) / 100);
}
