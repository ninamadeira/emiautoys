import { ErroNaoAutorizado } from '../domain/erros.js';

export class VerificarSessao {
  #emissorToken;
  #repositorioUsuario;

  constructor({ emissorToken, repositorioUsuario }) {
    this.#emissorToken = emissorToken;
    this.#repositorioUsuario = repositorioUsuario;
  }

  async executar({ token }) {
    const { usuarioId } = this.#emissorToken.verificar(token);
    if (!(await this.#repositorioUsuario.buscarPorId(usuarioId))) {
      throw new ErroNaoAutorizado();
    }
    return { usuarioId };
  }
}
