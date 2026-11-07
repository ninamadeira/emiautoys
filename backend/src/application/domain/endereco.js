import { ErroValidacao } from './erros.js';
import { normalizarCep } from './frete.js';
import { exigirTexto } from './validacao.js';

const PADRAO_UF = /^[A-Z]{2}$/;

function normalizarUf(estado) {
  const normalizado = exigirTexto(estado, 'estado').toUpperCase();
  if (!PADRAO_UF.test(normalizado)) {
    throw new ErroValidacao('estado', 'FORMATO_INVALIDO');
  }
  return normalizado;
}

export function criarEnderecoEntrega(propriedades) {
  return Object.freeze({
    nomeDestinatario: exigirTexto(propriedades.nomeDestinatario, 'nomeDestinatario'),
    cep: normalizarCep(propriedades.cep),
    rua: exigirTexto(propriedades.rua, 'rua'),
    numero: exigirTexto(propriedades.numero, 'numero'),
    complemento: typeof propriedades.complemento === 'string' ? propriedades.complemento.trim() : '',
    cidade: exigirTexto(propriedades.cidade, 'cidade'),
    estado: normalizarUf(propriedades.estado),
  });
}
