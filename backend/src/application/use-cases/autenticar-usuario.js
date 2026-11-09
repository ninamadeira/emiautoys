import { ErroCredenciaisInvalidas } from '../domain/erros.js';
import { normalizarEmail, paraUsuarioPublico } from '../domain/usuario.js';

export class AutenticarUsuario {
  #repositorioUsuario;
  #geradorHashSenha;
  #emissorToken;
  #emailsAdministradores;

  constructor({ repositorioUsuario, geradorHashSenha, emissorToken, emailsAdministradores = [] }) {
    this.#repositorioUsuario = repositorioUsuario;
    this.#geradorHashSenha = geradorHashSenha;
    this.#emissorToken = emissorToken;
    this.#emailsAdministradores = emailsAdministradores;
  }

  async executar({ email, senha }) {
    const usuario = await this.#repositorioUsuario.buscarPorEmail(normalizarEmail(email));
    if (!usuario) {
      throw new ErroCredenciaisInvalidas();
    }
    const senhaEstaCorreta = await this.#geradorHashSenha.verificar({
      senhaEmTextoPuro: String(senha),
      hashSenha: usuario.hashSenha,
    });
    if (!senhaEstaCorreta) {
      throw new ErroCredenciaisInvalidas();
    }
    const administrador = this.#emailsAdministradores.includes(usuario.email);
    return { token: this.#emissorToken.emitir(usuario.id), usuario: { ...paraUsuarioPublico(usuario), administrador } };
  }
}
