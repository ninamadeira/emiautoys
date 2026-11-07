import { createHmac, timingSafeEqual } from 'node:crypto';
import { ErroNaoAutorizado } from '../../../application/domain/erros.js';

const TAMANHO_MINIMO_SEGREDO = 32;
const PARTES_TOKEN = 2;
const MILISSEGUNDOS_POR_SEGUNDO = 1000;

export class EmissorTokenHmac {
  #segredo;
  #clock;
  #ttlSegundos;

  constructor({ segredo, clock, ttlSegundos }) {
    if (typeof segredo !== 'string' || segredo.length < TAMANHO_MINIMO_SEGREDO) {
      throw new TypeError(`O segredo do token deve ter ao menos ${TAMANHO_MINIMO_SEGREDO} caracteres`);
    }
    this.#segredo = segredo;
    this.#clock = clock;
    this.#ttlSegundos = ttlSegundos;
  }

  emitir(usuarioId) {
    const expiraEm = this.#agoraEmSegundos() + this.#ttlSegundos;
    const carga = Buffer.from(JSON.stringify({ sub: usuarioId, exp: expiraEm })).toString('base64url');
    return `${carga}.${this.#sign(carga)}`;
  }

  verificar(token) {
    const partes = String(token ?? '').split('.');
    const [carga, assinatura] = partes;
    if (partes.length !== PARTES_TOKEN || !this.#temAssinaturaValida(carga, assinatura)) {
      throw new ErroNaoAutorizado();
    }
    const declaracoes = this.#lerClaims(carga);
    if (declaracoes.exp <= this.#agoraEmSegundos()) {
      throw new ErroNaoAutorizado();
    }
    return { usuarioId: declaracoes.sub };
  }

  #lerClaims(carga) {
    try {
      return JSON.parse(Buffer.from(carga, 'base64url').toString('utf8'));
    } catch {
      throw new ErroNaoAutorizado();
    }
  }

  #temAssinaturaValida(carga, assinatura) {
    const expected = Buffer.from(this.#sign(carga));
    const actual = Buffer.from(String(assinatura));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  #sign(carga) {
    return createHmac('sha256', this.#segredo).update(carga).digest('base64url');
  }

  #agoraEmSegundos() {
    return Math.floor(this.#clock.agora().getTime() / MILISSEGUNDOS_POR_SEGUNDO);
  }
}
