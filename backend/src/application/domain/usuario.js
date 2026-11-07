import { ErroValidacao } from './erros.js';
import { exigirTexto } from './validacao.js';

export const TAMANHO_MINIMO_SENHA = 8;

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizarEmail(email) {
  const normalizado = exigirTexto(email, 'email').toLowerCase();
  if (!PADRAO_EMAIL.test(normalizado)) {
    throw new ErroValidacao('email', 'FORMATO_INVALIDO');
  }
  return normalizado;
}

export function garantirSenhaForte(senha) {
  const ehForte =
    typeof senha === 'string' &&
    senha.length >= TAMANHO_MINIMO_SENHA &&
    /[A-Za-z]/.test(senha) &&
    /\d/.test(senha);
  if (!ehForte) {
    throw new ErroValidacao('senha', 'FRACA_DEMAIS');
  }
}

export function criarUsuario({ id, nome, email, hashSenha, criadoEm }) {
  return Object.freeze({
    id: exigirTexto(id, 'id'),
    nome: exigirTexto(nome, 'nome'),
    email: normalizarEmail(email),
    hashSenha: exigirTexto(hashSenha, 'hashSenha'),
    criadoEm,
  });
}

export function paraUsuarioPublico(usuario) {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}
