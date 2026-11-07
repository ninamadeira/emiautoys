import { ErroNaoAutorizado } from '../../src/application/domain/erros.js';

export class GeradorHashSenhaFalso {
  async hash(senhaEmTextoPuro) {
    return `hashed:${senhaEmTextoPuro}`;
  }

  async verificar({ senhaEmTextoPuro, hashSenha }) {
    return hashSenha === `hashed:${senhaEmTextoPuro}`;
  }
}

export class EmissorTokenFalso {
  emitir(usuarioId) {
    return `token-for-${usuarioId}`;
  }

  verificar(token) {
    if (typeof token !== 'string' || !token.startsWith('token-for-')) {
      throw new ErroNaoAutorizado();
    }
    return { usuarioId: token.replace('token-for-', '') };
  }
}

export class GatewayPagamentoDuble {
  aprovado = true;
  cobrancas = [];

  async cobrar(requisicao) {
    this.cobrancas.push(requisicao);
    return { aprovado: this.aprovado, transacaoId: `tx-${this.cobrancas.length}` };
  }
}
