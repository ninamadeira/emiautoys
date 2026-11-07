import { ErroEmailJaCadastrado } from '../domain/erros.js';
import { garantirSenhaForte, criarUsuario, normalizarEmail, paraUsuarioPublico } from '../domain/usuario.js';

export class CadastrarUsuario {
  #repositorioUsuario;
  #geradorHashSenha;
  #geradorId;
  #clock;

  constructor({ repositorioUsuario, geradorHashSenha, geradorId, clock }) {
    this.#repositorioUsuario = repositorioUsuario;
    this.#geradorHashSenha = geradorHashSenha;
    this.#geradorId = geradorId;
    this.#clock = clock;
  }

  async executar({ nome, email, senha }) {
    garantirSenhaForte(senha);
    const emailNormalizado = normalizarEmail(email);
    await this.#garantirEmailLivre(emailNormalizado);
    const usuario = criarUsuario({
      id: this.#geradorId.proximo(),
      nome,
      email: emailNormalizado,
      hashSenha: await this.#geradorHashSenha.hash(senha),
      criadoEm: this.#clock.agora(),
    });
    await this.#repositorioUsuario.salvar(usuario);
    return paraUsuarioPublico(usuario);
  }

  async #garantirEmailLivre(email) {
    if (await this.#repositorioUsuario.buscarPorEmail(email)) {
      throw new ErroEmailJaCadastrado();
    }
  }
}
