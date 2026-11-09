import { criarProduto } from '../domain/produto.js';
import { garantirAdministrador } from '../domain/administrador.js';

export class CadastrarProduto {
  #repositorioProduto;
  #repositorioUsuario;
  #geradorId;
  #emailsAdministradores;

  constructor({ repositorioProduto, repositorioUsuario, geradorId, emailsAdministradores = [] }) {
    this.#repositorioProduto = repositorioProduto;
    this.#repositorioUsuario = repositorioUsuario;
    this.#geradorId = geradorId;
    this.#emailsAdministradores = emailsAdministradores;
  }

  async executar({ usuarioId, dados }) {
    garantirAdministrador(await this.#repositorioUsuario.buscarPorId(usuarioId), this.#emailsAdministradores);
    const produto = criarProduto({ ...dados, id: this.#geradorId.proximo() });
    await this.#repositorioProduto.salvar(produto);
    return produto;
  }
}
